<?php

//echo json_encode(["FILE",  __FILE__]); exit;

require_once("miconexion.php");

ob_clean(); //Limpia el buffer de salida (output buffer)
header('Content-Type: application/json; charset=utf-8'); //Le dice al navegador que la respuesta es un JSON
error_reporting(0);
ini_set('display_errors', 0);

//Evita que nos envíen datos por GET
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'ok' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}


