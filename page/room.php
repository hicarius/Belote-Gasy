<?php
require_once '../src/Apps/MySession.php';
use Apps\MySession;
$session = new MySession();
$session->start();
print_r($session->get('user'));
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
		<script>
			var uid = '';
			var websocket;
			$( function(){
				websocket = new WebSocket("ws://www.belote-gasy.com:9000/server");
				websocket.onopen = function (evt) {
					websocket.send(JSON.stringify({"type":"action/connected", "user":""}));
				};
				websocket.onerror	= function(socket){
					$('#message_box').append("<div class=\"system_error\">Error Occurred - "+socket.data+"</div>");
					console( 'Error : ' + socket.data);
				};
				websocket.onclose 	= function(socket){
					websocket.send(JSON.stringify({"type":"action/disconnected", "user":""}));
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

					//mise à jour de la liste des utilisateurs connectées
					if(data.type == 'listuser') {
						$('.list-users ul').html('');
						$.each(data.message, function(i, item){
							$('.list-users ul').append("<li>" + item + "</li>");
						});
					}

				};


				$('body').on('click', '.create-room', function(){
					$.ajax({
						method: 'post',
						url: '/create-room',
						success: function(){

						}
					});
				});
			});
			function console(debug)
			{
				$('#console').append(debug + '<br />');
			}
		</script>
	</head>
	<body>
		<div id="wrapper" class="container">
			<div class="col-md-12">
				<div class="panel panel-default col-md-8">
					<div class="panel-heading">
						Les salles
					</div>
					<div class="panel-body">
						<ul class="list-room col-xs-12">
							<li>
								<div class="well well-sm">
									<ul id="S1" class="room-container">
										<li id="u14586" class="room-user">
											<i class="avatar av-f1 col-xs-12"></i>
											<span class="u-name col-xs-12">Name</span>
											<button class="btn btn-xs btn-danger col-xs-12 room-out">Sortir</button>
										</li>
										<li id="u14586" class="room-user">
											<i class="avatar av-f5"></i>
											<span class="u-name col-xs-12">Name</span>
										</li>
										<li id="u14586" class="room-user">
											<i class="avatar av-m1"></i>
											<span class="u-name col-xs-12">Name</span>
										</li>
										<li id="u14586" class="room-user">
											<i class="avatar av-noname"></i>
											<button class="btn btn-xs btn-success room-in">Entrer</button>
										</li>
									</ul>
									<div class="clear"></div>
								</div>
							</li>
						</ul>
					</div>
					<div class="panel-footer">
						<input type="button" class="btn btn-success create-room" value="Créer une salle" />
					</div>
				</div>
				<div class="list-users col-lg-4">
					<div class="panel panel-default col-md-12">
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
		<div id="console" class="col-xs-12"></div>
	</body>
</html>
