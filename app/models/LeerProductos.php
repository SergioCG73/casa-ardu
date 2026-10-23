<?php
/*echo json_encode([
    "file" => __FILE__
]); exit;*/

ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);

require_once("miconexion.php");

$sqlSelect = "SELECT DISTINCT ProductoFabricado FROM recetas";
$stmt = $conexion->prepare($sqlSelect);
$stmt->execute();
$productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "productos" => $productos
]); exit;

?>