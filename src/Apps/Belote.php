<?php
namespace Apps;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use PDO;

class Belote implements MessageComponentInterface
{
    protected $sockets = array();
    protected $users = array();
    protected $rooms = array();
    protected $dbh;

    public function __construct() {
        //$this->dbh = new PDO('mysql:host=localhost;dbname=belote', 'root', '');
    }

    public function onOpen(ConnectionInterface $socket) {
        $sessionUser = $socket->Session->get('user');
        if(is_null($sessionUser)){
            $this->sendToRoom($socket, json_encode(array('type'=>'close')), true); //redirection vers home si connexion fermée
            $this->sendToRoom($socket, json_encode(array('type' => 'listuser', 'users' => User::getAllUsers($this->users))));
            $socket->close();
        }else {
            $user = new User($socket->resourceId, $socket, $sessionUser);
            $this->users[$socket->resourceId] = $user;
            $this->sockets[$socket->resourceId] = $socket;
            $this->sendToRoom($socket, json_encode(array('type' => 'listuser', 'users' => User::getAllUsers($this->users))));
            echo "New connection! ({$socket->resourceId}) : {$user->data->name} \n";
        }
        //Afficher tous les tables à sa connexion
        $this->sendToRoom($socket, json_encode(array('type' => 'room/loadAll', 'rooms' => $this->rooms)), true);
    }

    public function onMessage(ConnectionInterface $socket, $msgReceived) {
        $data = json_decode($msgReceived);
        switch($data->type){
            case "room/create":
                $this->rooms[$data->roomId][$socket->resourceId] = $this->users[$socket->resourceId];
                $this->users[$socket->resourceId]->setRoom($data->roomId);
                $this->sendToRoom($socket, json_encode(array('type' => 'room/load', 'roomId' => $data->roomId, 'room' => $this->rooms[$data->roomId])));
                echo "Room Created! ({$data->roomId}) \n";
                break;
            case "room/userjoin":
                $this->rooms[$data->roomId][$socket->resourceId] = $this->users[$socket->resourceId];
                $this->users[$socket->resourceId]->setRoom($data->roomId);
                $this->sendToRoom($socket, json_encode(array('type' => 'room/update', 'roomId' => $data->roomId, 'room' => $this->rooms[$data->roomId])));
                break;
            case "room/userleave":
                unset($this->rooms[$data->roomId][$socket->resourceId]);
                $this->users[$socket->resourceId]->setRoom(null);
                $this->sendToRoom($socket, json_encode(array('type' => 'room/update', 'roomId' => $data->roomId, 'room' => $this->rooms[$data->roomId])));
                $this->clearRoom();
                break;
            default:
                $this->sendToRoom($socket, $msgReceived);
                break;
        }

    }

    public function onClose(ConnectionInterface $socket) {
        if(isset($this->users[$socket->resourceId])) {
            if ($this->users[$socket->resourceId]->room !== NULL) {
                unset($this->rooms[$this->users[$socket->resourceId]->room][$socket->resourceId]);
            }
            echo "Connection {$socket->resourceId} : {$this->users[$socket->resourceId]->data->name} has disconnected\n";
        }

        //supprimer les rooms sans user
        $this->clearRoom();

        unset($this->sockets[$socket->resourceId]);
        unset($this->users[$socket->resourceId]);
        $this->sendToRoom($socket, json_encode(array('type' => 'listuser', 'users' => User::getAllUsers($this->users))));
    }

    public function onError(ConnectionInterface $socket, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";
        $socket->close();
    }

    public function sendToRoom($fromSocket, $msg, $toThisSocket = false)
    {
        if($toThisSocket){
            $fromSocket->send($msg);
        }else {
            foreach ($this->sockets as $socket) {
                //if ($fromSocket === $socket) {
                //   continue;
                //}
                // The sender is not the receiver, send to each client connected
                $socket->send($msg);
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
                $this->sendToRoom($socket, json_encode(array('type' => 'room/delete', 'roomId' => $roomId)));
                unset($this->rooms[$roomId]);
            }
        }
    }
}