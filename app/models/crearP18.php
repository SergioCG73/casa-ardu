<?php
// Este fichero recibe los datos enviados por AJAX desde formP18.js y los inserta en la tabla fabricaciones_en_curso

ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'ok' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

require_once("miconexion.php");

// Recoger datos
//$fechaHoraInicio = $_POST["fechaHoraInicio"] ?? "";
$numeroProduccion = $_POST["numeroProduccion"] ?? "";
$mezclador = $_POST["mezclador"] ?? "";
$receta = $_POST["receta"] ?? "";
$pesoInicialMezclador = $_POST["pesoInicialMezclador"] ?? "";
$pesoFinalMezclador = $_POST["pesoFinalMezclador"] ?? "";
$producto = $_POST["producto"] ?? "";
$notas = $_POST["notas"] ?? "";

// Validación
if (/*empty($fechaHoraInicio) ||*/
    empty($numeroProduccion) ||
    empty($mezclador) ||
    empty($receta) ||
    empty($pesoInicialMezclador)) {
    echo json_encode([
        'ok' => false,
        'message' => 'Faltan datos'
    ]);
    exit;
}

try {
    // INSERT
    /*$insertSQL = "INSERT INTO fabricaciones_en_curso
                  (FechaInicio, Mezclador, PesoInicialMezclador, Receta, NumeroFabricacion, Producto_id, Notas)
                  VALUES (:fechaHoraInicio, :Mezclador, :PesoInicialMezclador, :Receta, :numeroProduccion, :Producto, :Notas)";*/
                  
    $insertSQL = "INSERT INTO fabricaciones_en_curso
                  (Mezclador, PesoInicialMezclador, Receta, NumeroFabricacion, Producto_id, Notas)
                  VALUES (:Mezclador, :PesoInicialMezclador, :Receta, :numeroProduccion, :Producto, :Notas)";

    $insertStmt = $conexion->prepare($insertSQL);
    //$insertStmt->bindParam(":fechaHoraInicio", $fechaHoraInicio, PDO::PARAM_STR);
    $insertStmt->bindParam(":Mezclador", $mezclador, PDO::PARAM_STR);
    $insertStmt->bindParam(":PesoInicialMezclador", $pesoInicialMezclador, PDO::PARAM_INT);
    $insertStmt->bindParam(":Receta", $receta, PDO::PARAM_STR);
    $insertStmt->bindParam(":numeroProduccion", $numeroProduccion, PDO::PARAM_STR);
    $insertStmt->bindParam(":Producto", $producto, PDO::PARAM_STR);
    $insertStmt->bindParam(":Notas", $notas, PDO::PARAM_STR);
    $insertStmt->execute();

    // UPDATE 
    $updateSQL = "UPDATE equipos SET Estado = 'En uso' WHERE Equipo_id = :Mezclador";
    $updateStmt = $conexion->prepare($updateSQL);
    $updateStmt->bindParam(":Mezclador", $mezclador, PDO::PARAM_STR);
    $updateStmt->execute();

    echo json_encode([
    "ok" => true, 
    "numeroProduccion" => $numeroProduccion,
    //"fechaHoraInicio" => $fechaHoraInicio,
    "mezclado" => $mezclador,
    "pesoInicial" => $pesoInicialMezclador,
    "receta" => $receta, 
    "producto" => $producto,
    "message" => "Datos guardados correctamente"
    ]); 
    exit;    

} catch (PDOException $e) {
    echo json_encode([
        "ok" => false,
        "error" => $e->getMessage()
    ]);
    exit;
}
