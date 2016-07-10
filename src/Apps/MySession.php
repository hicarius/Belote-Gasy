<?php

namespace Apps;

use PDO;
use Symfony\Component\HttpFoundation\Session\Storage\Handler;
use Symfony\Component\HttpFoundation\Session\Attribute;

require dirname(__DIR__) . '/../vendor/autoload.php';

class MySession extends Handler\PdoSessionHandler
{
	protected $pdo;

	public function __construct()
	{
		ini_set('session.auto_start', 0);
		$options = array(
			'db_table' => 'sessions',
			'db_id_col' => 'sess_id',
			'db_data_col' => 'sess_data',
			'db_lifetime_col' => 'sess_lifetime',
			'db_time_col' => 'sess_time',
			'db_username' => '',
			'db_password' => '',
			'db_connection_options' => array(),
			'lock_mode' => 0,
		);
		$this->pdo = new PDO('mysql:host=localhost;dbname=belote;charset=utf8', 'root', '');
		$this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		parent::__construct($this->pdo, $options);
		session_set_save_handler(
			array(&$this, "_open"),
			array(&$this, "_close"),
			array(&$this, "_read"),
			array(&$this, "_write"),
			array(&$this, "_destroy"),
			array(&$this, "_gc")
		);
		session_start();
	}

	public function set($name, $value)
	{
		$_SESSION['_sf2_attributes'][$name] = $value;
	}

	public function get($name)
	{
		return $_SESSION['_sf2_attributes'][$name];
	}

	public function delete($name)
	{
		unset($_SESSION[$name]);
	}

	public function _open(){
		$sessionName = "PHPSESSID";
		$savePath = ini_get('session.save_path');
		return parent::open($savePath, $sessionName);
	}

	public function _close(){
		return parent::close();
	}

	public function _read($sessionId){
		$stmt = $this->pdo->query("SELECT sess_data FROM sessions WHERE sess_id = '$sessionId'");
		if($stmt->execute()){
			$row = $stmt->fetch();
			return is_resource($row['sess_data']) ? stream_get_contents($row['sess_data']) : $row['sess_data'];
		}else{
			return '';
		}
	}

	public function _write($sessionId, $data){
		$maxlifetime = (int) ini_get('session.gc_maxlifetime');
		$time = time();
		$stmt = $this->pdo->query("SELECT * FROM sessions WHERE sess_id = '{$sessionId}'");
		$stmt->execute();
		$result = $stmt->fetchAll();

		if( count($result) > 0 ) {
			$stmt = $this->pdo->query("UPDATE sessions SET sess_data = '{$data}', sess_lifetime = '{$maxlifetime}', sess_time = '{$time}' WHERE sess_id = '{$sessionId}'");
		}else {
			$stmt = $this->pdo->query("INSERT INTO sessions VALUES ('{$sessionId}', '{$data}', '{$maxlifetime}', '{$time}')");
		}
		if($stmt->execute()){
			return true;
		}

		return false;
	}

	public function _destroy($sessionId){
		return parent::destroy($sessionId);
	}

	public function _gc($maxlifetime){
		return parent::gc($maxlifetime);
	}
}