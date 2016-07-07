<?php
namespace Apps;

class User
{
    public $id;
    public $socket;
    public $data;
    public $room;

    public function __construct($id, $socket, $data)
    {
        $this->id = $id;
        $this->socket = $socket;
        $this->data = $data;
    }

    public function setRoom($roomId)
    {
        $this->room = $roomId;
    }

    public static function getAllUsers($users)
    {
        $result =  array();
        foreach($users as $user){
            $result[] = $user->data->name;
        }

        return $result;
    }
}