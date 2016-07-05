<?php
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use Ratchet\Session\SessionProvider;
use Symfony\Component\HttpFoundation\Session\Storage\Handler;
use Apps\Belote;

# Get database connection.
require dirname(__DIR__) . '/vendor/autoload.php';


$options = array(
    'db_table' => 'sessions',
    'db_id_col' => 'sess_id',
    'db_data_col' => 'sess_data',
    'db_lifetime_col' => 'sess_lifetime',
    'db_time_col' => 'sess_time',
    'db_username' => '',
    'db_password' => '',
    'db_connection_options' => array(),
    'lock_mode' => 2,
);
$pdo = new PDO('mysql:host=localhost;dbname=belote;charset=utf8', 'root', '');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$pdoSessionHandler = new Handler\PdoSessionHandler($pdo, $options);
$pdoSessionHandler->createTable();

$session = new SessionProvider(new Belote(), $pdoSessionHandler);

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            $session
        )
    ),
    9000
);

$server->run();
