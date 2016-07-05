<?php
namespace Apps;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use PDO;

class Belote implements MessageComponentInterface
{
    protected $sockets = array();
    protected $users = array();
    protected $dbh;

    public function __construct() {
        //$this->dbh = new PDO('mysql:host=localhost;dbname=belote', 'root', '');
    }

    public function onOpen(ConnectionInterface $socket) {
        if(!$socket->Session->get('BEL_HS_SOCK')) {//on enregistre le socket et l'user
            $user = new User($socket->resourceId, $socket, $socket->Session->get('user'));
            $this->users[$socket->resourceId] = $user;
            $this->sockets[$socket->resourceId] = $socket;
            $socket->Session->set('BEL_HS_SOCK', 1);
            $this->send($socket, json_encode(array('type' => 'listuser', 'message' => User::getAllUsers($this->users))));
            echo "New connection! ({$socket->resourceId}) : {$user->data->name} \n";
        }else{//on met à jour le nouveau socket de l'user

        }
    }

    public function onMessage(ConnectionInterface $socket, $msgReceived) {
        $data = json_decode($msgReceived);
        switch($data->type){
            case "newuser":

                break;
            case "action/connected":
                $user = $this->getUserBySocket($socket->resourceId);
                $this->users[$user->id]->name = $data->user;
                $this->send($socket, json_encode(array('type' => 'system', 'action'=>'connected','message' => $data->user .' est connecté')));
                break;
            default:
                $this->send($socket, $msgReceived);
                break;
        }

    }

    public function onClose(ConnectionInterface $socket) {
        $user = $this->getUserBySocket($socket->resourceId);
        if( $this->send($socket, json_encode(array('type' => 'system', 'action'=>'disconnected', 'message' => $user->name .' est déconnecté')))) {
            unset($this->sockets[$socket->resourceId]);
            unset($this->users[$socket->resourceId]);
            echo "Connection {$socket->resourceId} has disconnected\n";
        }
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";

        $conn->close();
    }

    public function send($from, $msg, $withSender = false)
    {
        foreach ($this->sockets as $socket) {
            //if ($from === $client && !$withSender ) {
             //   continue;
            //}
            // The sender is not the receiver, send to each client connected
            $socket->send($msg);
        }
        return true;
    }

    public function getUserBySocket($socket)
    {
        return $this->users[$socket];
    }
}