<?php
require_once '../src/Apps/MySession.php';
use Apps\MySession;
$session = new MySession();
$user = $session->get('user');
if( ($session->get('in_table') == 1 && $session->get('table') == $_GET['r']) == FALSE ){
    echo 'Invalid permissions !!!';
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Belote Gasy</title>
        <link rel="stylesheet" href="../assets/css/style.css">
        <script src="../assets/js/jquery.min.js"></script>
        <script src="../assets/js/easeljs-NEXT.combined.js"></script>
        <script src="../assets/js/tweenjs-NEXT.min.js"></script>
        <script src="../assets/js/soundjs-NEXT.min.js"></script>
        <script src="../assets/js/preloadjs-NEXT.min.js"></script>
        <script src="../assets/js/script.js"></script>
        <script src="../assets/js/EaselJsUtils.js"></script>
        <script src="../assets/js/belote.js"></script>
        <style type="text/css">
            html,body {
                font:normal 0.9em arial,helvetica;
            }
            #log {
                width:600px;
                height:300px;
                border:1px solid #7F9DB9;
                overflow:auto;
            }
            #msg {
                width:400px;
            }
        </style>
        <script>
            var uid = '<?php echo $user->id ?>';
            var websocket;
            $( function(){
                websocket = new WebSocket("ws://www.belote-gasy.com:9000/server");
                websocket.onopen = function (evt) {
                };
                websocket.onerror	= function(socket){
                    $('#message_box').append("<div class=\"system_error\">Error Occurred - "+socket.data+"</div>");
                    debug( 'Error : ' + socket.data);
                };
                websocket.onclose 	= function(socket){
                };
                websocket.onmessage = function(ev) {
                    var data = JSON.parse(ev.data); //PHP sends Json data
                    switch (data.type){
                        case 'console':
                            debug(data.msg);
                            break;
                        case 'close'://deconnexion
                            document.location.href = '/';
                            break;
                        case 'room/loadAll':
                            $('.list-room').html('');
                            $.each(data.rooms, function(roomId, room){
                                $('.list-room').append( createRoomHtml(roomId, room) );
                            });
                            break;
                        case 'game':
                            switch (data.action) {
                                case 'addPlayer':
                                    addPlayer(data.userId, data.userName);
                                    break;
                                case 'addPlayerToEquip':
                                    addPlayerToEquip(data.userId, data.equip);
                                    break;
                                case 'starting':
                                    initGame();
                                    break;
                                case 'prepareBoard':
                                    prepareBord(data.decks);
                                    break;
                            }
                            break;
                    }

                };
            });
        </script>
    </head>
    <body onload="">
        <div id="console"></div>
        <canvas id="card-canvas" width="800" height="600"></canvas>
        <div id="actions">
            <input type="button" value="AddPlayer" />
        </div>
    </body>
</html>