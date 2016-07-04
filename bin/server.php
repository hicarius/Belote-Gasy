<?php
/*use React\Socket\Server;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use Ratchet\Session\SessionProvider;
use Symfony\Component\HttpFoundation\Session\Storage\Handler;*/
use Apps\Belote;

# Get database connection.
require dirname(__DIR__) . '/vendor/autoload.php';


$loop   = React\EventLoop\Factory::create();
/*
// Set up our WebSocket server for clients wanting real-time updates
$webSock = new Server($loop);
$webSock->listen(8080, '0.0.0.0'); // Binding to 0.0.0.0 means remotes can connect
$webServer = new IoServer(
    new HttpServer(
        new WsServer(
            new SessionProvider(
                new Belote, $sessionSaveHanlder
            )
        )
    ),
    $webSock
);*/

$app = new Ratchet\App("localhost", 8080, '0.0.0.0', $loop);
$app->route('/server', new Belote, array('*'));
$app->run();
