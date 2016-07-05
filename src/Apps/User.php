<?php
namespace Apps;

class User
{
    public $id;
    public $socket;
    public $data;

    public function __construct($id, $socket, $data)
    {
        $this->id = $id;
        $this->socket = $socket;
        $this->data = $data;
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