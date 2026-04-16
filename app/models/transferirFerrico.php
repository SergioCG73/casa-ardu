<?php

ob_clean();
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["ok" => false, "error" => "Método no permitido"]);
    exit;
}

require_once("miconexion.php");
$conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// ===========================
// 1. Recoger datos del POST =
// ===========================
$numeroProduccion           = $_POST["numeroProduccion"] ?? null;
$mezcladorNuevo             = $_POST["mezclador"] ?? null;
$pesoM                      = $_POST["pesoInicialMezclador"] ?? null;
$pesoMF                     = $_POST["pesoFinalMezclador"] ?? null;
$volumenD111                = $_POST["volumenD111"] ?? null;
$receta                     = $_POST["receta"] ?? null;
$notas                      = $_POST["notas"] ?? null;
$modo                       = $_POST["modo"] ?? null;
$sacas                      = $_POST["sacas"] ??  null;

if (!$numeroProduccion) {
    echo json_encode([
        "ok" => false,
        "error" => "Falta numeroProduccion"
    ]);
    exit;
}

if ($modo === "transferir") {
    $sqlUpdate = "UPDATE fabricaciones_en_curso
              SET 
                  PesoInicialMezclador = :pesoM,
                  PesoFinalMezclador = :pesoMF,
                  FechaFinal = NOW(),
                  Notas = :notas,
                  Receta = :receta,
                  Sacas = :sacas
              WHERE NumeroFabricacion = :nf";


    $stmt = $conexion->prepare($sqlUpdate);
    $stmt->bindParam(":pesoM", $pesoM);
    $stmt->bindParam(":pesoMF", $pesoMF);
    $stmt->bindParam(":notas", $notas);
    $stmt->bindParam(":receta", $receta);
    $stmt->bindParam(":sacas", $sacas);
    $stmt->bindParam("nf", $numeroProduccion);
    $stmt->execute();

    echo json_encode([
        "ok" => true,
        "numeroProduccion" => $numeroProduccion,
        "mezcladorNuevo" => $mezcladorNuevo,
        "pesoM" => $pesoM,
        "pesoMF" => $pesoMF,
        "recetas" => $receta,
        "notas" => $notas,
        "sacas" => $sacas
    ]);
    exit;
}

if ($modo === "terminar") {
    $sqlInsert = "
INSERT INTO ferrico_terminadas (
    NumeroFabricacion,
    Mezclador,
    Fecha,
    Semana,
    Volumen_Inicial,
    Volumen_Final,    
    Notas
)
SELECT
    :nf,
    :mezclador,
    FechaInicio,
    WEEK(DATE_ADD(FechaInicio, INTERVAL 1 DAY), 1),
    :vi,
    :vf,
    :notas
FROM fabricaciones_en_curso
WHERE NumeroFabricacion = :nf
";

    $stmt = $conexion->prepare($sqlInsert);
    $stmt->bindParam(":nf", $numeroProduccion);
    $stmt->bindParam(":mezclador", $mezcladorNuevo);
    $stmt->bindParam(":vi", $pesoM);
    $stmt->bindParam(":vf", $pesoMF);    
    $stmt->bindParam(":notas", $notas);
    $stmt->execute();

    // Reactor → Vacío
    $sqlUpdate = "UPDATE equipos SET Estado = 'Vacio' WHERE Equipo_id = :mezclador";
    $stmt = $conexion->prepare($sqlUpdate);
    $stmt->execute([":mezclador" => $mezcladorNuevo]);

    // Actualizar depósito D111
    $sqlUpdate = "UPDATE equipos SET Volumen = :volumen WHERE Equipo_id = 'D111'";
    $stmt = $conexion->prepare($sqlUpdate);
    $stmt->bindParam(":volumen", $volumenD111);
    $stmt->execute();

    // Borrar fabricación en curso
    $numeroProduccion = (int)$numeroProduccion;

    $sqlDelete = "DELETE FROM fabricaciones_en_curso WHERE NumeroFabricacion = :nf";
    $stmtDelete = $conexion->prepare($sqlDelete);
    $stmtDelete->bindParam(":nf", $numeroProduccion, PDO::PARAM_INT);
    $stmtDelete->execute();

    echo json_encode([
        "ok" => true,
        "numeroProduccion" => $numeroProduccion,
        "mezcladorNuevo" => $mezcladorNuevo,
        "pesoM" => $pesoM,
        "pesoMF" => $pesoMF,
        "d11" => $volumen_D111,
        "recetas" => $receta,
        "notas" => $notas,
        "sacas" => $sacas
    ]);
    exit;
}


/*
// Reactor → Vacío
$sqlUpdate = "UPDATE equipos SET Estado = 'Vacio' WHERE Equipo_id = :mezclador";
$stmt = $conexion->prepare($sqlUpdate);
$stmt->execute([":mezclador" => $mezcladorNuevo]);

// Borrar fabricación en curso
$numeroProduccion = (int)$numeroProduccion;

$sqlDelete = "DELETE FROM fabricaciones_en_curso WHERE NumeroFabricacion = :nf";
$stmtDelete = $conexion->prepare($sqlDelete);
$stmtDelete->bindParam(":nf", $numeroProduccion, PDO::PARAM_INT);
$stmtDelete->execute();

echo json_encode([
    "ok" => true,
    "numeroProduccion" => $numeroProduccion,
    "mezcladorNuevo" => $mezcladorNuevo,
    "pesoM" => $pesoM,
    "pesoMF" => $pesoMF,
    "recetas" => $receta,
    "notas" => $notas,

]);
exit;*/
