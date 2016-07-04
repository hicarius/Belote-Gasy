<?php
namespace Apps;

class User
{
    public $id;
    //public $socket;
    public $name;

    public function __construct($id, $socket, $name = '')
    {
        $this->id = $id;
        //$this->socket = $socket;
        $this->name = $name;
    }
}