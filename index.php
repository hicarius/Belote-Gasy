<?php
require_once '/src/Apps/MySession.php';
use Apps\MySession;
$session = new MySession();
$session->start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Belote Gasy</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <script src="assets/js/jquery.min.js"></script>
    <style type="text/css">
        html,body {
            font:normal 0.9em arial,helvetica;
        }
    </style>
    <script>
        function connect()
        {
            $.ajax({
                method: 'POST',
                url: '/connect',
                data: 'username=' + $('#user').val(),
                success: function(html) {
                    if (html == 'TRUE') {
                        document.location.href = '/room';
                    }
                }
            });
        }
    </script>
</head>
<body onload="">
    <div style="margin: 0 auto">
        <input type="text" id="user" value="" />
        <input type="button" onclick="connect()" value="Connect" />
    </div>
</body>
</html>