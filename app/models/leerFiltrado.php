<?php

//echo json_encode(["FILE" => __FILE__,]); exit;

ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);

require_once("miconexion.php");

$modo = $_POST["modo"] ?? "";

/*echo json_encode([
        "modo" => $modo
]); exit;*/


/*if ($modo === "editar") {
    $sqlSelect = "SELECT * FROM fabricaciones_en_curso WHERE Producto_id = 'Filtrado'";
    $stmt = $conexion->prepare($sqlSelect);
    $stmt->execute();
    $datos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "datos" => $datos
    ]);
    exit;
} */
$sql = "SELECT * FROM mezclador_216";
$stmt = $conexion->prepare($sql);
$stmt->execute();
$m216 = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($m216) === 0) {
    echo json_encode([
        "LINE" => __LINE__,
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
        "M216" => $m216
    ]);exit;
}
