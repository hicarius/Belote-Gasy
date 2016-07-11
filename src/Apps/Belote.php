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

            //on les sépare en deux équipes
            if( isset($this->tables[$table]['equips']) ){
                $equipNumber = ( count($this->tables[$table]['equips'][0]) <= 1 )  ? 0 : 1 ;
            }else{
                $equipNumber = 0;
            }
            $this->tables[$table]['equips'][$equipNumber][] = $sessionUser->id;

            $this->tables[$table]['decks'] = array();
            $this->tables[$table]['users'][$sessionUser->id] = $sessionUser;
            $this->tables[$table]['loading'] = 0;
            $this->tables[$table]['sockets'][$sessionUser->id] = $socket;

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
                    $this->sendToClient($socket, json_encode(array('type' => 'game', 'action' => 'doPrepareBoard', 'decks' => $this->tables[$table]['decks'])));
                    $this->sendToClient($socket, json_encode(array('type' => 'game', 'action' => 'doPreparetFirstToRun', 'first' => $this->tables[$table]['first'], 'splitter' => $this->tables[$table]['splitter'], 'divider' => $this->tables[$table]['divider'])));
                }
                break;
			case 'game/card/split': 
				$table = $socket->Session->get('table');
				Table::splitDeck($this->tables[$table], $data->number);	
				$this->log($socket, "Table {$table} : Card splitted!");
				$this->sendToClient($socket, json_encode(array('type' => 'game', 'action' => 'doDivise', 'divider' => $this->tables[$table]['divider'], 'decks' => $this->tables[$table]['decks'])));
				break;
			case 'game/card/divise':
				$this->partageCard($socket, $data->number);
				break;
            case 'game/card/showAppel':
                $table = $socket->Session->get('table');
                $this->log($socket, "Table {$table} : Waiting for appeller {$data->appeller}");
                $this->sendToClient($socket, json_encode(array('type' => 'game', 'action' => 'doShowAppel', 'appeller' => $data->appeller )));
                break;
            case 'game/card/appel':
                $table = $socket->Session->get('table');
                $this->log($socket, "Table {$table} : Waiting for appeller {$data->nextAppeller}");
                $this->prepareAppel($socket, $data->appel, $data->nextAppeller);
                break;
            case 'game/card/placed':
                $this->placedCard($socket, $data->userId, $data->cardName);
                break;
            default:
                $this->sendToClient($socket, $msgReceived);
                break;
        }

    }

    public function prepareAppel($socket, $appel, $nextAppeller)
    {
        $sessionUser= $socket->Session->get('user');
        $table = $socket->Session->get('table');
        $isContre =  0;
        $isSurcontre =  0;
        if($appel != 'bo'){
            if($appel == 'cr'){
                $cAppel = $this->tables[$table]['appel'];
                $this->tables[$table]['appel'] = $cAppel . ' cr';
                $isContre =  1;
            }elseif($appel == 'sc') {
                $cAppel = $this->tables[$table]['appel'];
                $this->tables[$table]['appel'] = $cAppel . ' sc';
                $isSurcontre =  1;
            }else{
                $this->tables[$table]['appel'] = $appel;
            }
        }

        $this->log($socket, "Table {$table} : Player {$sessionUser->name} appelle {$appel}");
        $this->sendToClient($socket,
            json_encode(
                array(
                    'type' => 'game',
                    'action' => 'doAppel',
                    'userId' => $sessionUser->id,
                    'appel' => $appel,
                    'nextAppeller' => $nextAppeller,
                    'isContre' => $isContre,
                    'isSurcontre' => $isSurcontre,
                )
            )
        );
    }

    public function onClose(ConnectionInterface $socket) {
        if($socket->Session->get('in_table') == 0) {
            if (isset($this->users[$socket->resourceId])) {
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
        }else{
            $sessionUser = $socket->Session->get('user');
            $table = $socket->Session->get('table');
            unset($this->tables[$table]['users'][$sessionUser->id]);
            unset($this->tables[$table]['sockets'][$sessionUser->id]);
            $this->sendToClient($socket, json_encode(array('type' => 'game', 'action' => 'quit')), true);
            $this->log($socket, "Table {$table} : Player {$sessionUser->name} quit the table");
        }
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
        $this->log($socket, "Table {$table} : Preparing game ...");
        try {
            //prepartation players and equips
            $position = 1;
            foreach ($this->tables[$table]['equips'] as $equipId => $userInEquip) {
                foreach ($userInEquip as $userId) {
					if($position == 1){$firstPosition = 1; $splitter = 3; $divider = 4; $last = 2;}
                    $user = $this->tables[$table]['users'][$userId];
					$user->position = $position;
                    $this->sendToClient($socket, json_encode(array('type' => 'game', 'action' => 'doAddPlayer', 'userId' => $user->id, 'userName' => $user->name, 'position' => $position)));
                    $this->log($socket, "Table {$table} : User {$user->name} join the table");

                    $this->sendToClient($socket, json_encode(array('type' => 'game', 'action' => 'doAddPlayerToEquip', 'userId' => $user->id, 'equipId' => $equipId, 'position' => $position)));
                    $this->log($socket, "Table {$table} : User {$user->name} added to equip #{$equipId} ");
                    switch ($position){
                        case 1: $position = 3;break;
                        case 3: $position = 2;break;
                        case 2: $position = 4;break;
                        default:break;
                    }
                }
            }
			$this->tables[$table]['first'] = $firstPosition;
			$this->tables[$table]['splitter'] = $splitter;
			$this->tables[$table]['divider'] = $divider;
			$this->tables[$table]['last'] = $last;

            //preparation de la table
            if (Table::prepareDecks($this->tables[$table])) {
                $this->log($socket, "Table {$table} : Decks prepared and shuffled X 3 !");
                $this->sendToClient($socket, json_encode(array('type' => 'game', 'action' => 'doInit', 'table' => $table)));
            }
        }catch (Exception $e){
            $this->log($socket, "(ERROR)Table {$table} : " . $e->getMessage());
        }
    }
	
	protected function partageCard($socket, $number)
	{
        $table = $socket->Session->get('table');

		//check first player
		foreach ($this->tables[$table]['users'] as $user) {
			if($user->position == $this->tables[$table]['first']){
				$this->tables[$table]['rand_player'][0] = $user;
			}
			if($user->position == $this->tables[$table]['last']){
				$this->tables[$table]['rand_player'][1] = $user;
			}
			if($user->position == $this->tables[$table]['divider']){
				$this->tables[$table]['rand_player'][3] = $user;
			}
			if($user->position == $this->tables[$table]['splitter']){
				$this->tables[$table]['rand_player'][2] = $user;
			}
		}
		
		$decks = $this->tables[$table]['decks'];
		foreach($this->tables[$table]['rand_player'] as $player){
			for($i = 1; $i <= $number; $i++){
				$card = $decks[ count($decks) - 1 ];
				$this->tables[$table]['user_cards'][$player->id][] = $card;

				$this->log($socket, "Table {$table} : Card {$card} give to {$player->name}!");
				$this->sendToClient($socket, json_encode(array('type' => 'game', 'action' => 'doDiviseCard', 'userId' => $player->id, 'card' => $card)));
				//sleep(1);
				unset($this->tables[$table]['decks'][count($decks) - 1]);
				$decks = $this->tables[$table]['decks'];
			}
		}
	}

    public function placedCard($socket, $userId, $cardName)
    {
        $table = $socket->Session->get('table');
        $user =  $socket->Session->get('user');
        $this->tables[$table]['in_table'][$userId] = $cardName; //add carte to the table
        //remove card from the user
        foreach($this->tables[$table]['user_cards'][$userId] as $k => $carte){
            if($carte == $cardName){
                unset($this->tables[$table]['user_cards'][$userId][$k]);
                break;
            }
        }

        $userPosition = $this->tables[$table]['users'][$userId]->position;
        $this->log($socket, "Table {$table} : Card {$cardName} placed by {$user->name}!");
        $this->sendToClient($socket, json_encode(array('type' => 'game', 'action' => 'doPlacedCard', 'userPosition' => $userPosition, 'userId' => $userId, 'cardName' => $cardName)));

        //si tous les 4 cartes sont sur la table
        if( count($this->tables[$table]['in_table']) >= 4 ){
            $this->checkWinCard($socket);
        }

    }

    public function checkWinCard($socket)
    {
        $table = $socket->Session->get('table');
        $winnerUserId = Table::checkWinCard($this->tables[$table]);
        $this->log($socket, "Table {$table} : Winner card : {$winnerUserId} !!!");
    }
}