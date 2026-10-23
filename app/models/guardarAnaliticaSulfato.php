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
$densidad = floatval($data["densidad"] ?? 0);
$riqueza  = floatval($data["riqueza"] ?? 0);
$ph       = floatval($data["ph"] ?? 0);
$observaciones     = $data["observaciones"] ?? null;
$estado = null;

if (!$numeroFabricacion) {
    echo json_encode(["ok" => false, "error" => "Falta numeroFabricacion"]);
    exit;
}

//Determinar el estado de la producción

if ($densidad < 1.31 || $densidad > 1.335) {
    $estado = 1;
} 

if ($riqueza < 8.15 || $riqueza > 8.35) {
    $estado = $estado + 1;
}

if ($ph < 1.8 || $ph > 3) {
    $estado = $estado + 1;
}


$sql = "UPDATE sulfato_terminadas
        SET 
            Densidad = :densidad,
            Riqueza = :riqueza,
            EstadoAnalitica = :estado,
            NotasLab = :observaciones,
            Analitica = 1, 
            ph = :ph            
        WHERE NumeroFabricacion = :nf";

$stmt = $conexion->prepare($sql);
$stmt->bindParam(":nf", $numeroFabricacion);
$stmt->bindParam(":densidad", $densidad);
$stmt->bindParam(":riqueza", $riqueza);
$stmt->bindParam(":ph", $ph);
$stmt->bindParam(":estado", $estado);
$stmt->bindParam(":observaciones", $observaciones);
$stmt->execute();

echo json_encode([
    "ok" => true,
    "Densidad" => $densidad,
    "Riqueza" => $riqueza,
    "ph" => $ph,
    "EstadoAnalitica" => $estado,
    "NotasLab" => $observaciones
]);
exit;
