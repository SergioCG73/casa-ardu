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
$numeroProduccion   = $_POST["numeroProduccion"] ?? null;
$mezcladorNuevo     = $_POST["mezclador"] ?? null;
$reactorNuevo       = $_POST["reactor"] ?? null;
$receta             = $_POST["receta"] ?? null;
$pesoM              = $_POST["pesoInicialMezclador"] ?? null;
$pesoMF             = $_POST["pesoFinalMezclador"] ?? null;
$pesoR              = $_POST["pesoInicialReactor"] ?? null;
$pesoRF             = $_POST["pesoFinalReactor"] ?? null;
$producto           = $_POST["producto"] ?? null;
$modo               = $_POST["modo"] ?? null;
$fechaHoraInicio    = $_POST["fechaHoraInicio"] ?? null;
$fechaHoraFinal     = $_POST["fechaHoraFinal"] ?? null;

if (!$numeroProduccion) {
    echo json_encode(["ok" => false,                      
                      "error" => "Falta numeroProduccion"]);
    exit;
}

if ($pesoRF = "NaN") {
    $pesoRF = NULL;
}


// =============================
// 2. Obtener equipos actuales =
// =============================
$sqlOld = $pdo->prepare("
    SELECT Mezclador, Reactor
    FROM fabricaciones_en_curso
    WHERE NumeroFabricacion = :num
");

$sqlOld->execute([":num" => $numeroProduccion]);
$old = $sqlOld->fetch(PDO::FETCH_ASSOC);

// =========================================
// 1. Datos recibidos del formulario
// =========================================
$numeroFabricacion   = $_POST["numeroProduccion"] ?? null;
$mezcladorNuevo      = $_POST["mezclador"] ?? null;
$reactorNuevo        = $_POST["reactor"] ?? null;
$recetaSeleccionada  = $_POST["receta"] ?? null;
$pesoInicialMezcla   = $_POST["pesoInicialMezclador"] ?? null;
$pesoFinalMezcla     = $_POST["pesoFinalMezclador"] ?? null;
$pesoInicialReactor  = $_POST["pesoInicialReactor"] ?? null;
$pesoFinalReactor    = $_POST["pesoFinalReactor"] ?? null;
$producto            = $_POST["producto"] ?? null;
$modo                = $_POST["modo"] ?? null;

// =========================================
// 2. Obtener los equipos actualmente asignados
// =========================================
$sqlEquiposActuales = $pdo->prepare("
    SELECT Mezclador, Reactor
    FROM fabricaciones_en_curso
    WHERE NumeroFabricacion = :num
");
$sqlEquiposActuales->execute([":num" => $numeroFabricacion]);
$equiposActuales = $sqlEquiposActuales->fetch(PDO::FETCH_ASSOC);

if (!$equiposActuales) {
    echo json_encode(["ok" => false, "error" => "Producción no encontrada"]);
    exit;
}

$mezcladorAnterior = $equiposActuales["Mezclador"];
$reactorAnterior   = $equiposActuales["Reactor"];

// =========================================
// 3. Si el mezclador ha cambiado → actualizar estados
// =========================================
if ($mezcladorNuevo !== $mezcladorAnterior) {

    // Liberar mezclador anterior
    $sqlLiberarMezcladorAnterior = $pdo->prepare("
        UPDATE equipos SET Estado = 'Vacio'
        WHERE Equipo_id = :mezcladorAnterior
    ");
    $sqlLiberarMezcladorAnterior->execute([
        ":mezcladorAnterior" => $mezcladorAnterior
    ]);

    // Marcar mezclador nuevo como En uso
    $sqlOcuparMezcladorNuevo = $pdo->prepare("
        UPDATE equipos SET Estado = 'En uso'
        WHERE Equipo_id = :mezcladorNuevo
    ");
    $sqlOcuparMezcladorNuevo->execute([
        ":mezcladorNuevo" => $mezcladorNuevo
    ]);

    echo json_encode([
        "ok" => true,
        "modo" => $modo,
        "mezcladorAnterior" => $mezcladorAnterior,
        "mezcladorNuevo" => $mezcladorNuevo,
        "message" => "Cambio de mezclador realizado correctamente"
    ]);    
}

// =========================================
// 4. Liberar reactor anterior (si aplica)
// =========================================
$sqlLiberarReactorAnterior = $pdo->prepare("
    UPDATE equipos SET Estado = 'Vacio'
    WHERE Equipo_id = :reactorAnterior
");
$sqlLiberarReactorAnterior->execute([
    ":reactorAnterior" => $reactorAnterior
]);


// ======================================
// 4. Marcar nuevos equipos como En uso =
// ======================================
/*$sqlUse = $pdo->prepare("
    UPDATE equipos SET Estado = 'En uso'
    WHERE Equipo_id = :m OR Equipo_id = :r
");

$sqlUse->execute([
    ":m" => $mezcladorNuevo,
    ":r" => $reactorNuevo
]);*/

// ===========================
// 5. Actualizar la producción
// ===========================
if ($mezcladorNuevo !== $mezcladorAnterior) {

    // liberar viejo
    // marcar nuevo

    $sqlUpdate = $pdo->prepare("
        UPDATE fabricaciones_en_curso
        SET 
            Mezclador = :m,
            Reactor = :r,
            Receta = :receta,
            PesoInicialMezclador = :pm,
            PesoFinalMezclador = :pmf,
            PesoInicialReactor = :pr,
            PesoFinalReactor = :prf
        WHERE NumeroFabricacion = :num
    ");

    $sqlUpdate->execute([
        ":m"    => $mezcladorNuevo,
        ":r"    => $reactorNuevo,
        ":receta" => $receta,
        ":pm"   => $pesoM,
        ":pmf"  => $pesoMF,
        ":pr"   => $pesoR,
        ":prf"  => $pesoRF,
        ":num"  => $numeroProduccion
    ]);    
}

// Devolver JSON
echo json_encode([
    "ok" => true,
    "nº produccion" => $numeroProduccion,    
    "producto" => $producto,
    "modo" => $modo,
    "receta" => $receta,
    "pesoInicialMezclador" => $pesoM,
    "pesoFinalMezclador" => $pesoMF,
    "fechaHoraInicio" => $fechaHoraInicio,
    "fechaHoraFinal" => $fechaHoraFinal,
    "message" => "Producción actualizada correctamente"
    
]); exit;
/*echo json_encode([
    "ok" => true,
    "numeroProduccion" => $numeroProduccion,
    "mezcladorNuevo" => $mezcladorNuevo,
    "reactorNuevo" => $reactorNuevo,
    "receta" => $receta,
    "pesoM" => $pesoM,
    "pesoR" => $pesoR,
    "pesoRF" => $pesoRF,
    "producto" => $producto,
    "modo" => $modo,
    "fechaHoraInicio" => $fechaHoraInicio,
    "fechaHoraFinal" => $fechaHoraFinal,
    "semana" => $semana,
    "duracion" => $segundosTotales,
    "tiempoParado" => $segundosDesdePrevio,
    "horaprevia" => $HoraPrevia ? $HoraPrevia->format('Y-m-d H:i:s') : null,
    "message" => "Producción actualizada correctamente"    
]); exit;*/ 



?> 