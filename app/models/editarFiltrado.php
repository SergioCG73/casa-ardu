<?php 

header('Content-Type: application/json; charset=utf-8');

require_once("miconexion.php");

// ===========================
// 1. Recoger datos del POST
// ===========================
//$numeroProduccion     = $_POST["numeroProduccion"] ?? null;
$densidad             = $_POST["densidad"] ?? "";
$riqueza              = $_POST["riqueza"] ?? "";
$volInicialMezclador  = $_POST["vol_inicial_M216"] ?? null;
$volAgua              = $_POST["vol_agua"] ?? null;
$notas                = $_POST["notas"] ?? null;
$deposito             = $_POST["deposito"] ?? null;

$sqlUpdate = "UPDATE equipos SET Estado = 'Vacio' WHERE Equipo_id IN ('D105', 'D106', 'D107')";
$stmt = $conexion->prepare($sqlUpdate);
$stmt->execute();

$sqlUpdate = "UPDATE equipos SET Estado = 'En uso' WHERE Equipo_id = :id";
$stmt = $conexion->prepare($sqlUpdate);
$stmt->bindParam(":id", $deposito);
$stmt->execute();

$sqlUpdate = "UPDATE fabricaciones_en_curso 
              SET PesoInicialMezclador = :pi,
                  PesoFinalMezclador   = :pf,
                  Reactor              = :re,
                  Notas                = :n,
                  Densidad             = :d,
                  Riqueza              = :r
              WHERE Producto_id = 'Filtrado'";

$stmt = $conexion->prepare($sqlUpdate);

$stmt->execute([
    ':pi'      => $volInicialMezclador,
    ':pf'      => $volAgua,
    ':re'      => $deposito,
    ':n'       => $notas,
    ':d'       => $densidad,
    ':r'       => $riqueza
]);

echo json_encode([
    "densidad" => $densidad,
    "riqueza" => $riqueza,
    "volInicialMezclador" => $volInicialMezclador,
    "volAgua" => $volAgua,
    "notas" => $notas,
    "deposito" => $deposito
]); exit;

?>