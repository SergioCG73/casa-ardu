<?php 

//echo json_encode(["FILE" => __FILE__]); exit;

header('Content-Type: application/json; charset=utf-8');

require_once("miconexion.php");

// ===========================
// 1. Recoger datos del POST
// ===========================
$densidad             = $_POST["densidad"] ?? "";
$riqueza              = $_POST["riqueza"] ?? "";
$volInicialMezclador  = $_POST["vol_inicial_M216"] ?? null;
$volAgua              = $_POST["volAgua"] ?? null;
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
              SET PesoInicialMezclador     = :pM,
                  Volumen_Agua             = :agua,
                  Deposito                 = :dep,
                  NotasLab                 = :notas,
                  Densidad                 = :densidad,
                  Riqueza                  = :riqueza
              WHERE Producto_id = 'Filtrado'";

$stmt = $conexion->prepare($sqlUpdate);

$stmt->execute([
    ':pM'           => $volInicialMezclador,
    ':agua'         => $volAgua,
    ':dep'          => $deposito,
    ':notas'        => $notas,
    ':densidad'     => $densidad,
    ':riqueza'      => $riqueza
]);

echo json_encode([
    "ok"                   => true,
    "densidad"             => $densidad,
    "riqueza"              => $riqueza,
    "volInicialMezclador"  => $volInicialMezclador,
    "volAgua"              => $volAgua,
    "notas"                => $notas,
    "deposito"             => $deposito
]); exit;

?>
