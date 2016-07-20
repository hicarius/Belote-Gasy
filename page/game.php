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
                                case 'quit':
                                    document.location.href = '/room';
                                    break;
                                case 'doAddPlayer':
                                    addPlayer(data.userId, data.userName, data.position);
                                    break;
                                case 'doAddPlayerToEquip':
                                    addPlayerToEquip(data.userId, data.equipId, data.position);
                                    break;
                                case 'doInit':
                                    initGame();
                                    break;
                                case 'doPrepareBoard':
                                    prepareBord(data.decks);
                                    break;
								case 'doPrepareFirstToRun':
                                    checkFirstToRun(data.first, data.divider, data.splitter);
                                    break;
                                case 'showSplit':
                                    showSplitBlock();
                                    break;
                                case 'showDivise':
                                    showDiviseBlock();
                                    break;
                                case 'doDiviseCard':
                                    diviseCard(data.userId, data.card, data.nextPlayerToPartageCard);
                                    break;
                                case 'activateCard':
                                    activateCard(/*data.userPosition, data.actives*/);
                                    break;
                                case 'doPlacedCard':
                                    placedCard(data.userId, data.userPosition, data.cardName);
                                    break;
                                case 'clearAction':
                                    hideAction();
                                    break;
                                case 'showAppel':
                                    showAppelBlock(data.inputToEnabled);
                                    break;
                                case 'doAppel':
                                    appel(data.userId, data.appel, data.nextAppeller);
                                    break;
                                case 'removeInTable':
                                    setTimeout(
                                        function(){
                                            removeInTable(data.winnerPosition);
                                        }
                                    , 1000);
                                    break;
                                case 'showScore':
                                    showScore(data.e1, data.e2);
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
        <div id="game-wrapper">
            <canvas id="card-canvas" width="800" height="600"></canvas>
            <div id="actions" class="action">
                <input type="button" class="splitter" value="Couper" style="display:none;" />
                <input type="button" class="divider-2" value="Partage en 2 cartes" style="display:none;" />
                <input type="button" class="divider-3" value="Partage en 3 cartes" style="display:none;" />
                <div class="appel" style="display:none;">
                    <ul>
                        <li><input type="button" class="m-appel tr" value="Treffle"></li>
                        <li><input type="button" class="m-appel ca" value="Carreau"></li>
                        <li><input type="button" class="m-appel co" value="Coeur"></li>
                        <li><input type="button" class="m-appel pi" value="Pique"></li>
                    </ul>
                    <ul>
                        <li><input type="button" class="m-appel sa" value="Sans As"></li>
                        <li><input type="button" class="m-appel ta" value="Tout As"></li>
                    </ul>
                    <ul>
                        <li><input type="button" class="m-appel bo" value="Bonne"></li>
                        <li><input type="button" class="m-appel cr" value="Contré"></li>
                        <li><input type="button" disabled="disabled" class="m-appel sc" value="Surcontré"></li>
                    </ul>
                </div>
            </div>
        </div>
    </body>
</html>