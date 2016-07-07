<?php
require_once '../src/Apps/MySession.php';
use Apps\MySession;
$session = new MySession();
$user = $session->get('user');
?>
<!DOCTYPE html>
<html>
	<head>
		<title>Les Salles</title>
		<link rel="stylesheet" type="text/css" media="all" href="../assets/css/reset.css" />
		<!-- BOOTSTRAP STYLESHEET -->
		<link rel="stylesheet" type="text/css" media="all" href="../assets/css/bootstrap.min.css" />
		<!-- MAIN THEME STYLESHEET -->
		<link rel='stylesheet' id='responsive-css'  href='../assets/css/responsive.css' type='text/css' media='all' />
		<link rel='stylesheet' id='fonts-css'  href='../assets/css/font-awesome.min.css' type='text/css' media='all' />
		<link rel="stylesheet" href="../assets/css/sb-admin-2.css">
		<link rel="stylesheet" href="../assets/css/style.css">
		<script src="../assets/js/jquery.min.js"></script>
		<script src="../assets/js/belote.js"></script>
		<script>
			var uid = '';
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
						case 'close'://deconnexion
							document.location.href = '/';
							break;
						case 'listuser'://mise à jour de la liste des utilisateurs connectées
							$('.list-users ul').html('');
							$.each(data.users, function(i, user){
								$('.list-users ul').append("<li>" + user + "</li>");
							});
							break;
						case 'room/loadAll':
							$('.list-room').html('');
							$.each(data.rooms, function(roomId, room){
								$('.list-room').append( createRoomHtml(roomId, room) );
							});
							break;
						case 'room/load':
							$('.list-room').append( createRoomHtml(data.roomId, data.room) );
							break;
						case 'room/update':
							$('.list-room div#' + data.roomId).html( updateRoomHtml(data.roomId, data.room) );
							break;
						case 'room/delete':
							$('.list-room div#' + data.roomId).remove();
							break;
					}

				};
			});
		</script>
	</head>
	<body>
		<div id="wrapper" class="container">
			<div class="container col-md-12">
				<div class="container col-md-8">
					<div class="panel panel-default">
						<div class="panel-heading">
							Les salles
						</div>
						<div class="panel-body">
							<ul class="list-room col-xs-12">

							</ul>
						</div>
						<div class="panel-footer">
							<input type="button" class="btn btn-success create-room" value="Créer une salle" />
						</div>
					</div>
				</div>
				<div class="list-users container col-lg-4" style="padding-left: 5px;">
					<div class="panel panel-default">
						<div class="panel-heading">
							Les joueurs connectées
						</div>
						<div class="panel-body">
							<ul></ul>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div id="console" class="container col-xs-12"></div>
	</body>
</html>
