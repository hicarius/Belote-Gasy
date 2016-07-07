<?php
namespace Apps;

class Room
{
    public static function getAllRooms($rooms)
    {
        $result =  array();
        foreach($rooms as $room){
            $result[] = $room->data->name;
        }

        return $result;
    }
}