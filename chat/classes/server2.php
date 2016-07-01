#!/usr/bin/env php -q
<?php
require_once('./WebSocketServer.php');
class Server extends WebSocketServer {
	//protected $maxBufferSize = 1048576; //1MB... overkill for an echo server, but potentially plausible for other applications.

	protected function process ($user, $message) {
		//$this->send($user,$message);
		$message = json_decode($message,true);
		switch($message['type']){
			case "ctrl/chat/out" :
				$this->onCtrlChatOut($user, $message['data']);
				break;

			case "ctrl/connection":
				$msg = json_decode($message['data']);
				$user->setData(array('name' => $msg->user));
				$this->broadcast('{"action": "ws/chat/in", "msg":"Bienvenue '.$user->data['name'].'"}');
				break;

			case "debug":
				$this->stdout("User : " . print_r($user, true));
				break;
			default :
				$this->onActionError($user, $message);
				break;
		}
	}

	protected function connected ($user) {
		// Do nothing: This is just an echo server, there's no need to track the user.
		// However, if we did care about the users, we would probably have a cookie to
		// parse at this step, would be looking them up in permanent storage, etc.
	}

	protected function closed ($user) {
		// Do nothing: This is where cleanup would go, in case the user had any sort of
		// open files or other objects associated with them.  This runs after the socket
		// has been closed, so there is no need to clean up the socket itself here.
		$this->broadcast('{"action": "ws/chat/in", "msg":"Au revoir '.$user->data['name'].'"}');
	}

	protected function connecting($user)
	{
		$this->stdout("User : " . print_r($user, true));
	}

	public function onCtrlChatOut($from, $msg){
		$msg = json_decode($msg);
		if($msg->message==='demo.stop'){
			$msg->message='WebSockets server is going down...';
			$this->broadcast('{"action": "ws/chat/in", "msg":'.json_encode($msg).'}');
			die();
		}
		$this->broadcast('{"action": "ws/chat/in", "msg":'.json_encode($msg).'}');
	}

	function onActionError($user, $msg){
		$this->send($user, '{"action":"error", "msg":"'.$msg.'"}');
	}

	public function broadcast($msg, $excludeUser=''){
		foreach($this->users as $user){
			if($excludeUser){
				if($user->id!=$excludeUser->id) {
					$this->send($user, $msg);
				}
			}else {
				$this->send($user, $msg);
			}
		}
	}


	protected function send($user, $message) {
		if ($user->handshake) {
			$message = $this->frame($message,$user);
			print_r($message . "\n");
			$result = socket_write($user->socket, $message, strlen($message));
			print_r($result . "\n");
		}
		else {
			// User has not yet performed their handshake.  Store for sending later.
			$holdingMessage = array('user' => $user, 'message' => $message);
			$this->heldMessages[] = $holdingMessage;
		}
	}

	public function     say($msg=""){ echo $msg."\n"; }
	public function    wrap($msg=""){ return chr(0).$msg.chr(255); }
	public function  unwrap($msg=""){ return substr($msg,1,strlen($msg)-2); }
}
$echo = new Server("127.0.0.1","8000");
try {
	$echo->run();
}
catch (Exception $e) {
	$echo->stdout($e->getMessage());
}