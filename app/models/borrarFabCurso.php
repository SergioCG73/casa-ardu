<?php

ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);

require_once("miconexion.php");

$input = json_decode(file_get_contents("php://input"), true);

$mezclador = $input["Mezclador"];
$reactor = $input["Reactor"];

$NumeroFabricacion = $input["NumeroFabricacion"];

$sqlDelete = "DELETE FROM fabricaciones_en_curso
              WHERE NumeroFabricacion = :num";

$stmt = $conexion->prepare($sqlDelete);
$stmt->bindParam(":num", $NumeroFabricacion);
$ok = $stmt->execute();

$sqlUpdate = "UPDATE equipos SET Estado = 'Vacio' WHERE Equipo_id = :mezclador";
$stmt = $conexion->prepare($sqlUpdate);
$stmt->bindParam(":mezclador", $mezclador);
$rtdo = $stmt->execute();


$sqlUpdate = "UPDATE equipos SET Estado = 'Vacio' WHERE Equipo_id = :reactor";
$stmt = $conexion->prepare($sqlUpdate);
$stmt->bindParam(":reactor", $reactor);
$rtdo = $stmt->execute();

/*echo json_encode([
    "ok" => true,
    "input" => $input,
    "mezclador" => $mezclador,
    "reactor" => $reactor,
    "mensaje" => "Update OK"
]); exit; */




echo json_encode([
    "ok" => $ok,
    "status" => $ok ? "Registro eliminado" : "Error al eliminar",
    "NumeroFabricacion" => $NumeroFabricacion
]);

?>