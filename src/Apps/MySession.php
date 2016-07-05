<?php

namespace Apps;

use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Session\Storage\NativeSessionStorage;
use Symfony\Component\HttpFoundation\Session\Storage\Handler\PdoSessionHandler;
use PDO;

require dirname(__DIR__) . '/../vendor/autoload.php';

class MySession
{
	protected $session;

	public function __construct()
	{
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

		$pdoSessionHandler = new PdoSessionHandler($pdo, $options);

		$storage = new NativeSessionStorage(array(), $pdoSessionHandler);
		$this->session = new Session($storage);
	}

	public function start()
	{
		if (!$this->session->isStarted()) {
			$this->session->start();
		}
	}

	public function set($name, $value)
	{
		$this->session->set($name, $value);
	}

	public function get($name)
	{
		return $this->session->get($name);
	}
}