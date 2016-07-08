<?php

require_once '../src/Apps/MySession.php';
use Apps\MySession;
$session = new MySession();

$users = array(
    array('0', 'heri'),
    array('1', 'heri1'),
    array('2', 'heri2'),
    array('3', 'heri3'),
    array('4', 'heri4'),
    array('5', 'heri5'),
);

$html = "FALSE";
foreach( $users as $u ){
    if( $_POST['username'] == $u[1] ){
        $user = new stdClass();
        $user->id = $u[0];
        $user->name = $u[1];
        $session->set('user', $user);
        $session->set('in_table', 0);
        $html = "TRUE";
        break;
    }
}
echo $html;