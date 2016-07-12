<?php
namespace Apps;

use PDO;

class Belote
{
    protected static $cards = array(
        "A" => 11,
        "K" => 4,
        "Q" => 3,
        "J" => 20,
        "10" => 10,
        "9" => 14,
        "8" => 0,
        "7" => 0,
    );

    protected static $colors = array(
        "tr" => 1,
        "ca" => 2,
        "co" => 3,
        "pi" => 4,
    );

    public static function checkWinCard(&$table)
    {
        $in_table = $table['in_table'];
        $winnerUserPosition = null;
        $higherCard = null;
        foreach($in_table as $userPosition => $card){
            self::getHigherCard($winnerUserPosition, $higherCard, $userPosition, $card);
        }

        return array('position' => $winnerUserPosition, 'card' => $higherCard);
    }

    protected static function getHigherCard(&$winnerUserPosition, &$higherCard, $userPosition, $card)
    {
        if($higherCard == null) {
            $higherCard = $card;
            $winnerUserPosition = $userPosition;
        }else{
            $couleurCard = substr($card, 0, 2);//couleur card
            $pointCard = substr($card, 2);//couleur card
            $couleurHigher = substr($higherCard, 0, 2);//couleur higher
            $pointHigher = substr($higherCard, 2);//point higher

            if (self::$cards[$pointCard] > self::$cards[$pointHigher]) {
                $higherCard = $card;
                $winnerUserPosition = $userPosition;
            } elseif (self::$cards[$pointCard] == self::$cards[$pointHigher]) {
                if (self::$colors[$couleurCard] > self::$colors[$couleurHigher]) {
                    $higherCard = $card;
                    $winnerUserPosition = $userPosition;
                }
            }
        }
    }

    public static function getCardScore($card)
    {
        $pointCard = substr($card, 2);
        return self::$cards[$pointCard];
    }

    public static function countScore(&$table)
    {
        $score1 = 0;
        $score2 = 0;
        foreach($table['deck_equip1'] as $card){
            $score1 += self::getCardScore($card);
        }
        foreach($table['deck_equip2'] as $card){
            $score2 += self::getCardScore($card);
        }

        return array($score1, $score2);
    }
}