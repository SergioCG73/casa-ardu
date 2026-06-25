<?php
//require_once __DIR__ . "/../../config/config.php";

define("DB_DSN", "mysql:host=localhost;dbname=fabricaciones");
define("DB_USER", "root");
define("DB_PASS", "");
try {
    // Conexión PDO
    $conexion = new PDO(DB_DSN, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => true
    ]);
} catch (PDOException $e) {
    // Devuelve JSON SIEMPRE, NO texto plano
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        "ok" => false,
        "error" => "Error en la conexión: " . $e->getMessage()
    ]);
    exit; // termina la ejecución
}
