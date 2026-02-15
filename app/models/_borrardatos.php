<?php

ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);

require_once("miconexion.php");
 

// Recibir JSON
$input = json_decode(file_get_contents("php://input"), true);

$NumeroFabricacion = $input["NumeroFabricacion"];

// Consulta segura
$sqlDelete = "DELETE FROM fabricaciones_en_curso
              WHERE NumeroFabricacion = :num";

$stmt = $conexion->prepare($sqlDelete);
$stmt->bindParam(":num", $NumeroFabricacion);

// Ejecutar
$ok = $stmt->execute();

// Respuesta
echo json_encode([
    "ok" => $ok,
    "status" => $ok ? "Registro eliminado" : "Error al eliminar",
    "NumeroFabricacion" => $NumeroFabricacion
]);






?>
