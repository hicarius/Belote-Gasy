<?php
$users = array(
    array('heri', 'heri'),
    array('heri1', 'heri1'),
    array('heri2', 'heri2'),
    array('heri3', 'heri3'),
    array('heri4', 'heri4'),
    array('heri5', 'heri5'),
);

$html = "FALSE";
foreach( $users as $user ){
    if( $_POST['username'] == $user[0] ){
        $html = "TRUE";
    }
}
echo $html;