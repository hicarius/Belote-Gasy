<?php
require_once '../src/Apps/MySession.php';
use Apps\MySession;
$session = new MySession();
$session->start();
$user = $session->get('user');

$room = new stdClass();
$room->id = 5;

$html = '
			<li>
				<div class="well well-sm">
					<ul id="S' . $room->id . '" class="room-container">
						<li id="U' . $user->id . '" class="room-user">
							<i class="avatar av-f1 col-xs-12"></i>
							<span class="u-name col-xs-12">' . $user->name . '</span>
							<button class="btn btn-xs btn-danger col-xs-12 room-out">Sortir</button>
						</li>
						<li id="u14586" class="room-user">
							<i class="avatar av-noname"></i>
							<span class="u-name col-xs-12">Name</span>
						</li>
						<li id="u14586" class="room-user">
							<i class="avatar av-noname"></i>
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
';

echo $html;