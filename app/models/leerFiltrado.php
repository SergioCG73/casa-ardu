<?php

echo json_encode(["FILE" => __FILE__,]); exit;

ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);

require_once("miconexion.php");

$modo = $_POST["modo"] ?? "";

//$sql = "SELECT * FROM mezclador_216";
$sqlSelect = "SELECT * FROM fabricaciones_en_curso WHERE Producto_id = 'Filtrado'";
$stmt = $conexion->prepare($sqlSelect);
$stmt->execute();
$filtraciones_en_curso = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(["filtraciones" => $filtraciones_en_curso]); exit;

if (count($filtraciones_en_curso) === 0) {
    echo json_encode([
        "M216" => "Nada que filtrar"
    ]);
    exit;
} else {
    $sql = "SELECT * FROM equipos WHERE Tipo = 'Depósito' AND ProductoFabricado = 'P18'";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $depositos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "Depositos" => $depositos,
        "M216" => $filtraciones_en_curso
    ]);exit;
}

?>