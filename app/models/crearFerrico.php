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

$numeroProduccion = $_POST["numeroProduccion"] ?? "";
$mezclador = $_POST["mezclador"] ?? "";
$pesoInicialMezclador = $_POST["pesoInicialMezclador"] ?? "";
$receta = $_POST["receta"] ?? "";
$sacas = $_POST["sacas"] ?? "";
$notas = $_POST["notas"] ?? "";
$producto = "Ferrico";

if ($sacas === "1") {
    $sacas = 1;
} else {
    $sacas = 0;
}

//Validación de datos recibidos
try {
    $insertSQL = "INSERT INTO fabricaciones_en_curso
                      (FechaInicio, Mezclador, PesoInicialMezclador, Receta, NumeroFabricacion, Producto_id, Notas, Sacas) 
                      VALUES (NOW(), :mezclador, :pesoInicialMezclador, :receta, :numeroProduccion, :producto, :notas, :sacas)";

    $insertStmt = $conexion->prepare($insertSQL);
    $insertStmt->bindParam(":mezclador", $mezclador, PDO::PARAM_STR);
    $insertStmt->bindParam(":pesoInicialMezclador", $pesoInicialMezclador, PDO::PARAM_INT);
    $insertStmt->bindParam(":receta", $receta, PDO::PARAM_STR);
    $insertStmt->bindParam(":numeroProduccion", $numeroProduccion, PDO::PARAM_STR);
    $insertStmt->bindParam(":producto", $producto, PDO::PARAM_STR);
    $insertStmt->bindParam(":notas", $notas, PDO::PARAM_STR);
    $insertStmt->bindParam(":sacas", $sacas, PDO::PARAM_INT);
    $insertStmt->execute();

    //SQL para UPDATE estados en la tabla equipos    
    $updateSQL = "UPDATE equipos
                     SET Estado = 'En uso'
                     WHERE Equipo_id IN (:Mezclador)";

    $updateStmt = $conexion->prepare($updateSQL);
    $updateStmt->bindParam(":Mezclador", $mezclador, PDO::PARAM_STR);
    $updateStmt->execute();

    echo json_encode([
        "ok" => true,
        "numeroProduccion" => $numeroProduccion,
        "mezclador" => $mezclador,
        "pesoInicialMezclador" => $pesoInicialMezclador,
        "receta" => $receta,
        "sacas" => $sacas,
        "notas" => $notas,
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
