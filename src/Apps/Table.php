<?php
namespace Apps;

class Table
{
    public $id;
    public $users = array();
    public $equips = array();
    public $decks = array();
    public $score = array();
	public $first;
	public $divider;
	public $splitter;
	public $last;
	public $rand_player;
	public $user_cards = array();

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

}