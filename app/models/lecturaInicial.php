<?php

/*echo json_encode([
    "file" => __FILE__
]); exit;*/

ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);

require_once("miconexion.php");

// Entrada combinada: JSON o POST
$input = json_decode(file_get_contents("php://input"), true);
$modo = $input["modo"] ?? $_POST["modo"] ?? null;
$producto = $input["producto"] ?? $_POST["producto"] ?? null;

// 1) Producciones en curso
$sql = "SELECT * FROM fabricaciones_en_curso ORDER BY FechaInicio DESC";
$stmt = $conexion->prepare($sql);
$stmt->execute();
$producciones_en_curso = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 2) Volumen en M216
$sql = "SELECT SUM(Volumen) AS TotalVolumen FROM mezclador_216";
$stmt = $conexion->prepare($sql);
$stmt->execute();
$result = $stmt->fetch(PDO::FETCH_ASSOC);
$volumen_M216 = $result["TotalVolumen"] ?? 0;
$volumen_M216 = intval($volumen_M216);

// Filtrar las que NO son "0000"
$solo_fabricaciones = array_filter(
    $producciones_en_curso,
    fn($fila) =>
    $fila["NumeroFabricacion"] !== "0000"
);

echo json_encode([
    "ok" => true,
    "FILE" => __FILE__,
    "LINE" => __LINE__,
    "modo" => $modo,
    "producto" => $producto,
    "producciones_en_curso" => $producciones_en_curso,
    "volumen_M216" => $volumen_M216
]);
exit;
