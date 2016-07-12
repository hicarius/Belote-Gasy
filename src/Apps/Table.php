<?php
namespace Apps;

class Table
{
    public $id;
    public $users = array();
    public $equips = array();
    public $decks = array();
    public $score = array();

	public $first; //reset à chaque partie
	public $divider; //reset à chaque partie
	public $splitter; //reset à chaque partie
	public $last; //reset à chaque partie
	public $rand_player; //reset à chaque partie
	public $user_cards = array(); //reset à chaque partie

    public $in_table = array(); //reset à chaque mise en table

    public $appel; //reset à chaque partie
    public $appel_position; //reset à chaque partie
    public $decks_equip1 = array(); //reset à chaque partie
    public $decks_equip2 = array(); //reset à chaque partie

    public function __construct($id)
    {
        $this->id = $id;
    }

    public function setData($key, $value)
    {
        $this->$key = $value;
    }

    public function getData($key)
    {
        return $this->$key;
    }

    public static function checkToStart($room)
    {
        return ( count($room)>=4 );
    }

    public static function prepareDecks(&$table)
    {
        $tColors = array('tr', 'ca', 'co', 'pi');
        $tNumbers = array(7, 8, 9, 10, 'J', 'Q', 'K', 'A');
        foreach($tColors as $color){
            foreach($tNumbers as $number){
                $table['decks'][] = $color.$number;
            }
        }

        shuffle($table['decks']);
        shuffle($table['decks']);
        shuffle($table['decks']);

        return true;
    }

	public static function splitDeck(&$table, $number)
	{		
		$deck_1 = array();
		$deck_2 = array();
		foreach($table['decks'] as $k => $card){
			if($k < $number){
				$deck_1[] = $card;
			}else{
				$deck_2[] = $card;
			}			
		}
		$table['decks'] = array_merge($deck_2, $deck_1);		
	}

    public static function getDividerSocket($table)
    {
        return self::getSocketByPosition($table, $table['divider']);
    }

    public static function getSplitterSocket($table)
    {
        return self::getSocketByPosition($table, $table['splitter']);
    }

    public static function getSocketByPosition($table, $position)
    {
        foreach($table['users'] as $user){
            if($user->position == $position){
                return $table['sockets'][$user->id];
            }
        }
    }

    public static function getNextPositionByPosition($position)
    {
        if($position == 1){ $nextPosition = 2;}
        if($position == 2){ $nextPosition = 3;}
        if($position == 3){ $nextPosition = 4;}
        if($position == 4){ $nextPosition = 1;}
        return $nextPosition;
    }

    public static function getEnabledAppel($table, $appel, $position)
    {
        $cAppel = $table['appel'];
        $arrayToEnabled = array();

        if($appel == ''){
            $arrayToEnabled = array('tr', 'ca', 'co', 'pi', 'sa', 'ta');
        }else{
            switch($appel){
                case 'tr': $arrayToEnabled = array('ca', 'co', 'pi','sa', 'ta', 'bo'); break;
                case 'ca': $arrayToEnabled = array('co', 'pi','sa', 'ta', 'bo'); break;
                case 'co': $arrayToEnabled = array('pi', 'sa', 'ta', 'bo'); break;
                case 'pi': $arrayToEnabled = array('sa', 'ta', 'bo'); break;
                case 'sa': $arrayToEnabled = array('ta', 'bo'); break;
                case 'ta': $arrayToEnabled = array('bo'); break;
                case 'bo':
                    switch($cAppel){
                        case 'tr': $arrayToEnabled = array('ca', 'co', 'pi','sa', 'ta', 'bo'); break;
                        case 'ca': $arrayToEnabled = array('co', 'pi','sa', 'ta', 'bo'); break;
                        case 'co': $arrayToEnabled = array('pi', 'sa', 'ta', 'bo'); break;
                        case 'pi': $arrayToEnabled = array('sa', 'ta', 'bo'); break;
                        case 'sa': $arrayToEnabled = array('ta', 'bo'); break;
                        case 'ta': $arrayToEnabled = array('bo'); break;
                    }
                    break;
            }
            switch($table['appel_position']){//si adva
                case 1: if( in_array($position, array(2,4))){$arrayToEnabled[] = 'cr';} break;
                case 2: if( in_array($position, array(3,1))){$arrayToEnabled[] = 'cr';} break;
                case 3: if( in_array($position, array(4,2))){$arrayToEnabled[] = 'cr';} break;
                case 4: if( in_array($position, array(1,3))){$arrayToEnabled[] = 'cr';} break;
            }
            if($appel == 'cr'){ //si contré
                switch($table['appel_position']){//si adva
                    case 1: if( in_array($position, array(2,4))){$arrayToEnabled = array('sc', 'bo');} break;
                    case 2: if( in_array($position, array(3,1))){$arrayToEnabled = array('sc', 'bo');} break;
                    case 3: if( in_array($position, array(4,2))){$arrayToEnabled = array('sc', 'bo');} break;
                    case 4: if( in_array($position, array(1,3))){$arrayToEnabled = array('sc', 'bo');} break;
                }
            }
        }
        return $arrayToEnabled;
    }
}