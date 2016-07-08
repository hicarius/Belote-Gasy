<?php
namespace Apps;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use PDO;
use Ratchet\Wamp\Exception;

class Belote implements MessageComponentInterface
{
    protected $sockets = array();
    protected $users = array();
    protected $rooms = array();
    protected $tables = array();
    protected $dbh;

    public function __construct() {
        //$this->dbh = new PDO('mysql:host=localhost;dbname=belote', 'root', '');
    }

    public function onOpen(ConnectionInterface $socket) {
        $sessionUser = $socket->Session->get('user');
        //si l'user est dans la salle
        if($socket->Session->get('in_table') == 0) {
            if (is_null($sessionUser)) {
                $this->sendToClient($socket, json_encode(array('type' => 'close')), true); //redirection vers home si connexion fermée
                $this->sendToClient($socket, json_encode(array('type' => 'listuser', 'users' => User::getAllUsers($this->users))));
                $socket->close();
            } else {
                $user = new User($socket->resourceId, $socket, $sessionUser);
                $this->users[$socket->resourceId] = $user;
                $this->sockets[$socket->resourceId] = $socket;
                $this->sendToClient($socket, json_encode(array('type' => 'listuser', 'users' => User::getAllUsers($this->users))));
                $this->log($socket, "New connection! ({$socket->resourceId}) : {$user->data->name}");
            }
            //Afficher tous les tables à sa connexion
            $this->sendToClient($socket, json_encode(array('type' => 'room/loadAll', 'rooms' => $this->rooms)), true);
        }else{ //si l'user est sur la table
            $table = $socket->Session->get('table');
            $this->tables[$table]['decks'] = array();
            $this->tables[$table]['users'][$sessionUser->id] = $sessionUser;
            $this->tables[$table]['loading'] = 0;
            $this->tables[$table]['sockets'][$sessionUser->id] = $socket;

            $this->sendToClient($socket, json_encode(array('type' => 'game', 'action' => 'addPlayer', 'userId' => $sessionUser->id, 'userName' => $sessionUser->name )));
            $this->log($socket, "Table {$table} : User {$sessionUser->name} join the table");

            //on les sépare en deux équipes
            if( isset($this->tables[$table]['equips']) ){
                $equipNumber = ( count($this->tables[$table]['equips'][0]) <= 1 )  ? 0 : 1 ;
            }else{
                $equipNumber = 0;
            }

            $this->tables[$table]['equips'][$equipNumber][] = $sessionUser->id;
            $this->sendToClient($socket, json_encode(array('type' => 'game', 'action' => 'addPlayerToEquip', 'userId' => $sessionUser->id, 'equip' => $equipNumber )));
            $this->log($socket, "Table {$table} : User {$sessionUser->name} added to equip n°{$equipNumber} ");

            if( count($this->tables[$table]['users']) >= 4 ){ //tous les 4 joueurs sont connectées sur la table
                $this->log($socket, "Table {$table} : All players are join the table");
                $this->_prepareTable($socket, $table);
            }
        }
    }

    public function onMessage(ConnectionInterface $socket, $msgReceived) {
        $data = json_decode($msgReceived);
        switch($data->type){
            case "room/create":
                $this->_createRoom($socket);
                break;
            case "room/userjoin":
                $this->_userJoinRoom($socket, $data);
                break;
            case "room/userleave":
                $this->_userLeaveRoom($socket, $data);
                break;
            case "room/countDown/stop":
                $this->_countDownStopRoom($socket, $data);
                break;
            case "room/goToGame":
                $this->sendToClient($socket, json_encode(array('type' => 'room/loadGame', 'roomId' => $data->roomId )), true);
                unset($this->rooms[$this->users[$socket->resourceId]->room]);
                unset($this->users[$socket->resourceId]);
                unset($this->sockets[$socket->resourceId]);
                $this->clearRoom($socket);
                break;
            case 'game/loadcomplete':
                $table = $socket->Session->get('table');
                $this->tables[$table]['loading']++;
                if($this->tables[$table]['loading'] >= 4){
                    $this->log($socket, "Table {$table} : Card prepared!");
                    $this->sendToClient($socket, json_encode(array('type' => 'game', 'action' => 'prepareBoard', 'decks' => $this->tables[$table]['decks'])));
                }
                break;
            default:
                $this->sendToClient($socket, $msgReceived);
                break;
        }

    }

    public function onClose(ConnectionInterface $socket) {
        if(isset($this->users[$socket->resourceId])) {
            if ($this->users[$socket->resourceId]->room !== NULL) {
                unset($this->rooms[$this->users[$socket->resourceId]->room][$socket->resourceId]);
                $this->sendToClient($socket, json_encode(array('type' => 'room/update', 'roomId' => $this->users[$socket->resourceId]->room, 'room' => $this->rooms[$this->users[$socket->resourceId]->room])));
            }
            $this->log($socket, "Connection {$socket->resourceId} : {$this->users[$socket->resourceId]->data->name} has disconnected");
        }

        //supprimer les rooms sans user
        $this->clearRoom($socket);

        unset($this->sockets[$socket->resourceId]);
        unset($this->users[$socket->resourceId]);
        $this->sendToClient($socket, json_encode(array('type' => 'listuser', 'users' => User::getAllUsers($this->users))));
    }

    public function onError(ConnectionInterface $socket, \Exception $e) {
        $this->log($socket,"An error has occurred: {$e->getMessage()}");
        $socket->close();
    }

    public function log($socket, $msg)
    {
        echo "$msg \n";
        $this->sendToClient($socket, json_encode(array('type' => 'console', 'msg' => $msg )));
    }

    public function sendToClient($fromSocket, $msg, $toThisSocket = false)
    {
        $isInTable = $fromSocket->Session->get('in_table');
        if( $isInTable == 1){ //message vient du table
            $table = $fromSocket->Session->get('table');
            if ($toThisSocket) {
                $fromSocket->send($msg);
            }else {
                foreach ($this->tables[$table]['sockets'] as $socket) {
                    $socket->send($msg);
                }
            }
        }else {//message global
            if ($toThisSocket) {
                $fromSocket->send($msg);
            } else {
                foreach ($this->sockets as $socket) {
                    $socket->send($msg);
                }
            }
        }
        return true;
    }

    /**
     * Teste si l'user dans la session est déjà enregistré dans websocket
     * @param $sessionUser
     * @return bool|int|string
     */
    public function isUserExist($sessionUser)
    {
        foreach ($this->users as $resourceId => $user) {
            if($user->data->id == $sessionUser->id){
                return $resourceId;
            }
        }
        return false;
    }

    public function getUserBySocket($socket)
    {
        return $this->users[$socket];
    }

    public function clearRoom($socket = null)
    {
        foreach($this->rooms as $roomId => $room){
            if( count($room) <= 0){
                $this->sendToClient($socket, json_encode(array('type' => 'room/delete', 'roomId' => $roomId)));
                $this->log($socket, "Room Deleted! ({$roomId})");
                unset($this->rooms[$roomId]);
            }
        }
    }

    protected function _createRoom($socket)
    {
        $roomId = uniqid('R');
        $this->rooms[$roomId][$socket->resourceId] = $this->users[$socket->resourceId];
        $this->users[$socket->resourceId]->setRoom($roomId);
        $this->sendToClient($socket, json_encode(array('type' => 'room/load', 'roomId' => $roomId, 'room' => $this->rooms[$roomId])));
        $this->log($socket, "Room Created! ({$roomId})");
    }

    protected function _userLeaveRoom($socket, $data)
    {
        unset($this->rooms[$data->roomId][$socket->resourceId]);
        $this->users[$socket->resourceId]->setRoom(null);
        $this->sendToClient($socket, json_encode(array('type' => 'room/update', 'roomId' => $data->roomId, 'room' => $this->rooms[$data->roomId])));
        $this->clearRoom($socket);
    }

    protected function _userjoinRoom($socket, $data)
    {
        $this->rooms[$data->roomId][$socket->resourceId] = $this->users[$socket->resourceId];
        $this->users[$socket->resourceId]->setRoom($data->roomId);
        $this->sendToClient($socket, json_encode(array('type' => 'room/update', 'roomId' => $data->roomId, 'room' => $this->rooms[$data->roomId])));
        //test si 4 user sont inscrits dans la table, si oui, on demarre le jeu
        if( Table::checkToStart($this->rooms[$data->roomId]) ){
            //lancement du compte à rebours pour demarrer la table
            $this->log($socket, "Room Start! ({$data->roomId})");
            $this->sendToClient($socket, json_encode(array('type' => 'room/attemptToStart', 'roomId' => $data->roomId, 'room' => $this->rooms[$data->roomId])));
        }
    }

    protected function _countDownStopRoom($socket, $data)
    {
        $this->sendToClient($socket, json_encode(array('type' => 'room/stopCountDown', 'roomId' => $data->roomId, 'room' => $this->rooms[$data->roomId])));
    }

    protected function _prepareTable($socket, $table)
    {
        $this->log($socket, "Table {$table} : Starting game ...");
        try {
            //preparation de la table
            if (Table::prepareDecks($this->tables[$table])) {
                $this->log($socket, "Table {$table} : Decks prepared!");
                $this->sendToClient($socket, json_encode(array('type' => 'game', 'action' => 'starting', 'table' => $table)));
            }
        }catch (Exception $e){
            $this->log($socket, "(ERROR)Table {$table} : " . $e->getMessage());
        }
    }
}