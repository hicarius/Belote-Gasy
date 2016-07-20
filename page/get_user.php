<?php

require_once '../src/Apps/MySession.php';
use Apps\MySession;
$session = new MySession();

/*$users = array(
    array('0', 'heri'),
    array('1', 'heri1'),
    array('2', 'heri2'),
    array('3', 'heri3'),
    array('4', 'heri4'),
    array('5', 'heri5'),
    array('6', 'nampoina'),
    array('7', 'fidy'),
    array('8', 'zo'),
);*/

//$html = "FALSE";
//foreach( $users as $u ){
   // if( $_POST['username'] == $u[1] ){
        $user = new stdClass();
        $user->id = rand(1,500);//$u[0];
        $user->name = $_POST['username'];//$u[1];
        $session->set('user', $user);
        $session->set('in_table', 0);
        $html = "TRUE";
     //   break;
   // }
//}
echo $html;