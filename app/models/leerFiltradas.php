<?php

ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);

require_once("miconexion.php");


$SelectSQL = "SELECT * FROM filtraciones_p18";
$stmt = $conexion->prepare($SelectSQL);
$stmt->execute();
$filtradas = $stmt->fetchAll(PDO::FETCH_ASSOC);

$SelectActiva = "
    SELECT * 
    FROM fabricaciones_en_curso 
    WHERE Producto_id = 'Filtrado'
    LIMIT 1
";

$stmt = $conexion->prepare($SelectActiva);
$stmt->execute();
$activa = $stmt->fetch(PDO::FETCH_ASSOC);

// 3) Respuesta unificada
echo json_encode([
    "filtradas" => $filtradas,
    "activa"    => $activa
]);
