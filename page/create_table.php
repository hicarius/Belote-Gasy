<?php
require_once '../src/Apps/MySession.php';
use Apps\MySession;
$session = new MySession();
$user = $session->get('user');
$session->set('table', $_POST['room']);
$session->set('in_table', 1);