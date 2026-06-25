<?php

//echo json_encode(["FILE" => __FILE__]); exit;

ob_clean();
header('Content-Type: application/json; charset=utf-8');

require_once("miconexion.php");
$conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Recibir JSON
$json = file_get_contents("php://input");
$data = json_decode($json, true);

$numeroFabricacion = $data["numeroFabricacion"] ?? null;
$densidad          = $data["densidad"] ?? null;
//$acidez            = $data["acidez"] ?? null;
$riqueza           = $data["riqueza"] ?? null;
$observaciones     = $data["observaciones"] ?? null;
$estado = null;

//echo json_encode(["numeroFabricacion" => $numeroFabricacion]); exit;

if (!$numeroFabricacion) {
    echo json_encode(["ok" => false, "error" => "Falta numeroFabricacion"]);
    exit;
}

//Determinar el estado de la producción
if ($densidad < 1.31 || $densidad > 1.43) {
    $estado = 1;
} 

if ($riqueza < 37.5 || $riqueza > 38.45) {
    $estado = $estado + 1;
}


$sql = "UPDATE ferrico_terminadas
        SET 
            Densidad = :densidad,
            /*Acidez = :acidez,*/
            Riqueza = :riqueza,
            Analitica = 1,
            NotasLab = :obs,
            EstadoAnalitica = :estado
        WHERE NumeroFabricacion = :nf";

$stmt = $conexion->prepare($sql);
$stmt->bindParam(":nf", $numeroFabricacion);
$stmt->bindParam(":densidad", $densidad);
//$stmt->bindParam(":acidez", $acidez);
$stmt->bindParam(":riqueza", $riqueza);
$stmt->bindParam(":obs", $observaciones);
$stmt->bindParam(":estado", $estado);
$stmt->execute();

echo json_encode([
    "ok" => true,
    "densidad" => $densidad,
    "riqueza" => $riqueza,/*
    "acidez" => $acidez,*/
    "estado" => $estado,
    "notas" => $observaciones
]);
exit;
