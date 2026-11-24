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


$pesoInicialM511 = $_POST["pesoInicialM511"] ?? null;
$pesoFinalM511 = $_POST["pesoFinalM511"] ?? null;
$operario = $_POST["operario"] ?? null;
$numeroFabricacion = $_POST["fabricacion"] ?? null;
$numeroFabricacion = str_replace(".", "", $numeroFabricacion);
$producto = "HB10";
$volumenAgua = $_POST["volumenAgua"] ?? null;
$carbonatoCalcico = $_POST["carbonatoCalcico"] ?? null;
$aguaDosificada = $_POST["aguaDosificada"] ?? 0;
$notas = $_POST["notas"] ?? null;


$insertSQL = "INSERT INTO fabricaciones_en_curso 
                      (FechaInicio, PesoInicialMezclador, PesoFinalMezclador, NumeroFabricacion, Producto_id, Notas, Volumen_Agua, PesoInicialReactor, Sacas)
                      VALUES (NOW(), :pesoInicial, :pesoFinal, :numeroProduccion, :producto, :notas, :volumen, :carbonato, :aguaDosificada)";

$stmt = $conexion->prepare($insertSQL);
$stmt->bindParam(":pesoInicial", $pesoInicialM511, PDO::PARAM_STR);
$stmt->bindParam(":pesoFinal", $pesoFinalM511, PDO::PARAM_STR);
$stmt->bindParam(":numeroProduccion", $numeroFabricacion, PDO::PARAM_STR);
$stmt->bindParam(":producto", $producto, PDO::PARAM_STR);
$stmt->bindParam(":notas", $notas, PDO::PARAM_STR);
$stmt->bindParam(":volumen", $volumenAgua, PDO::PARAM_INT);
$stmt->bindParam(":carbonato", $carbonatoCalcico, PDO::PARAM_INT);
$stmt->bindParam(":aguaDosificada", $aguaDosificada, PDO::PARAM_INT);
$stmt->execute();

echo json_encode([
    "ok" => true,
    "message" => "Producción guardada correctamente",
    "pesoInicialM511" => $pesoInicialM511,
    "pesoFinalM511" => $pesoFinalM511,
    "operario" => $operario,
    "numeroFabricacion" => $numeroFabricacion,
    "producto" => $producto,
    "volumenAgua" => $volumenAgua,
    "carbonatoCalcico" => $carbonatoCalcico,
    "aguaDosificada" => $aguaDosificada
]);
exit;
