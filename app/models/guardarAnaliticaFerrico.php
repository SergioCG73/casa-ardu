<?php

ob_clean();
header('Content-Type: application/json; charset=utf-8');

require_once("miconexion.php");
$conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Recibir JSON
$json = file_get_contents("php://input");
$data = json_decode($json, true);

$numeroFabricacion = $data["numeroFabricacion"] ?? null;
$densidad          = $data["densidad"] ?? null;
$acidez            = $data["acidez"] ?? null;
$riqueza           = $data["riqueza"] ?? null;
$observaciones     = $data["observaciones"] ?? null;

if (!$numeroFabricacion) {
    echo json_encode(["ok" => false, "error" => "Falta numeroFabricacion"]);
    exit;
}

$sql = "INSERT INTO ferrico_terminadas 
        (NumeroFabricacion, Densidad, Acidez, Riqueza, Analitica, Observaciones)
        VALUES (:nf, :densidad, :acidez, :obs, :analitica, :riqueza)";

$stmt = $conexion->prepare($sql);
$stmt->bindParam(":nf", $numeroFabricacion);
$stmt->bindParam(":densidad", $densidad);
$stmt->bindParam(":acidez", $acidez);
$stmt->bindParam(":riqueza", $riqueza);
$stmt->bindParam(":obs", $observaciones);
$stmt->bindParam(":analitica", 1);
//$stmt->execute();

echo json_encode(["ok" => true]);
exit;
