<?php
ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["ok" => false, "error" => "Método no permitido"]);
    exit;
}

require_once __DIR__ . "/miconexion.php";

$pdo = $conexion;

// ===========================
// 1. Recoger datos del POST =
// ===========================
$numeroProduccion           = $_POST["numeroProduccion"] ?? null;
$fechaHoraInicio            = $_POST["fechaHoraInicio"] ?? null;
$mezcladorNuevo             = $_POST["mezclador"] ?? null;
$pesoM                      = $_POST["pesoInicialMezclador"] ?? null;
$pesoMF                     = $_POST["pesoFinalMezclador"] ?? null;
$reactorNuevo               = $_POST["reactor"] ?? null;
$pesoR                      = $_POST["pesoInicialReactor"] ?? null;
$pesoRF                     = $_POST["pesoFinalReactor"] ?? null;
$receta                     = $_POST["receta"] ?? null;
$producto                   = $_POST["producto"] ?? null;
$modo                       = $_POST["modo"] ?? null;
$fechaInicioReaccion        = $_POST["fechaInicioReaccion"] ?? null;
$fechaHoraFinal             = $_POST["fechaHoraFinal"] ?? null;

if (!$numeroProduccion) {
    echo json_encode(["ok" => false,                      
                      "error" => "Falta numeroProduccion"]);
    exit;
}

// (El resto del código permanece intacto)

if ($modo === "transferir" && $producto === "P18" && $pesoRF === null) { 
    //transferencia de Mezclador a Reactor
    $sqlUpdate = $pdo->prepare("
        UPDATE fabricaciones_en_curso
        SET 
            FechaInicioReaccion = :horaInicioReaccion,
            PesoFinalMezclador = :pesoMF,
            Reactor = :reactor,
            PesoInicialReactor = :pesoR
        WHERE NumeroFabricacion = :numerofabricacion
    ");

    $sqlUpdate->execute([
        ':horaInicioReaccion'      => $fechaInicioReaccion,        
        ':pesoMF'                  => $pesoMF,
        ':reactor'                 => $reactorNuevo,    
        ':pesoR'                   => $pesoR,    
        ':numerofabricacion'       => $numeroProduccion,    
    ]);

    // Actualizar estado de equipos
    $sqlUpdateMezclador = $pdo->prepare("
        UPDATE equipos
        SET Estado = 'Vacio'
        WHERE  Equipo_id = :mezclador
    ");
    $sqlUpdateMezclador->execute([':mezclador' => $mezcladorNuevo]);

    $sqlUpdateReactor = $pdo->prepare("
        UPDATE equipos
        SET Estado = 'En uso'
        WHERE Equipo_id = :reactor
    ");
    $sqlUpdateReactor->execute([':reactor' => $reactorNuevo]);

    echo json_encode([
        "ok"                        => true,
        "modo"                      => $modo,
        "fechaHoraTransferencia"    => $fechaHoraFinal,
        "mezclador"                 => $mezcladorNuevo,
        "pesoInicialMezclador"      => $pesoM,
        "pesoFinalMezclador"        => $pesoMF,
        "reactor"                   => $reactorNuevo,    
        "pesoInicialReactor"        => $pesoR,
        "receta"                    => $receta,
        "numeroProduccion"          => $numeroProduccion,
        "producto"                  => $producto,
        "mensaje"                   => "Transferencia Mezclador a Reactor"
    ]); 
    exit;
}

// (El resto del código continúa intacto hasta el final)
