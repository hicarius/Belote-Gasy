<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Belote Gasy</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <script src="assets/js/jquery.min.js"></script>
    <script src="assets/js/easeljs-NEXT.combined.js"></script>
    <script src="assets/js/tweenjs-NEXT.min.js"></script>
    <script src="assets/js/soundjs-NEXT.min.js"></script>
    <script src="assets/js/preloadjs-NEXT.min.js"></script>
    <script src="assets/js/script.js"></script>
    <script src="assets/js/EaselJsUtils.js"></script>
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
        var websocket;
        $(document).ready(function(){
            //create a new WebSocket object.
            var wsUri = "ws://localhost:8080/server";
            websocket = new WebSocket(wsUri);

            websocket.onopen = function (evt) {
                websocket.send(JSON.stringify({"type":"action/connected", "user":"<?php echo $_GET['g']?>"}));
            };

            websocket.onerror	= function(socket){
                $('#message_box').append("<div class=\"system_error\">Error Occurred - "+socket.data+"</div>");
                console( 'Error : ' + socket.data);
            };

            websocket.onclose 	= function(socket){
                websocket.send(JSON.stringify({"type":"action/disconnected", "user":"<?php echo $_GET['g']?>"}));
            };

            websocket.onmessage = function(ev) {
                var data = JSON.parse(ev.data); //PHP sends Json data
                if(data.type == 'system')
                {
                    $('#message_box').append("<div class=\"system_msg\">"+data.message+"</div>");
                    console(data.message);
                    if(data.message == 'demo.stop'){
                        websocket.close();
                    }
                }

                if(data.type == 'usermsg')
                {
                    $('#message_box').append("<div><span class=\"user_name\">"+data.name+"</span> : <span class=\"user_message\">"+data.message+"</span></div>");
                }

                $('#message').val(''); //reset text
            };

            $('#send-btn').click(function(){ //use clicks message send button
                var mymessage = $('#message').val(); //get message text
                if(mymessage == ""){ //emtpy message?
                    alert("Enter Some message Please!");
                    return;
                }

                //prepare json data
                var msg = {
                    type: 'usermsg',
                    message: mymessage
                };
                //convert and send data to server
                websocket.send(JSON.stringify(msg));
            });

            //#### Message received from server?



        });

        function console(debug)
        {
            $('#console').append(debug + '<br />');
        }

        function quit(){
            websocket.close();
            document.location.href = '/index.php';
        }
    </script>
</head>
<body onload="">
<canvas id="card-canvas" width="800" height="600"></canvas>
<div id="actions">
    <input type="button" value="AddPlayer" />
</div>
<div id="console"></div>
<div class="chat_wrapper">
    <div class="message_box" id="message_box"></div>
    <div class="panel">
        <input type="text" name="message" id="message" placeholder="Message" maxlength="80" style="width:89%" />
        <button id="send-btn">Send</button>
        <input type="button" onclick="quit()" value="Quit" />
    </div>
</div>
</body>
</html>