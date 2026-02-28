<?php
require_once __DIR__ . "/../../config/config.php";

try {
    // Conexión PDO
    $conexion = new PDO(DB_DSN, DB_USER, DB_PASS);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Devuelve JSON SIEMPRE, NO texto plano
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        "ok" => false,
        "error" => "Error en la conexión: " . $e->getMessage()
    ]);
    exit; // termina la ejecución
}
?>
