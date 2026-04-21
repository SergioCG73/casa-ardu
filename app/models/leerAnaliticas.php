<?php

/*echo json_encode([
    "FILE" => __FILE__
]); exit;*/

ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);

require_once("miconexion.php");

// Entrada combinada: JSON o POST
$input = json_decode(file_get_contents("php://input"), true);
$productos = $input["productosSeleccionados"] ?? $_POST["productosSeleccionados"] ?? null;

//echo json_encode(["productos" => $productos]); exit;

// Obtener analíticas de los productos seleccionados
$in  = str_repeat('?,', count($productos) - 1) . '?';
$sql = "SELECT * FROM analiticas WHERE Producto IN ($in)";
$stmt = $conexion->prepare($sql);
$stmt->execute($productos);
$analiticas = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(["analiticas" => $analiticas]); exit;

?>