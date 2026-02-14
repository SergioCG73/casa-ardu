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

if ($modo === "transferir") {
    
// ========================
// 9. Cálculo de la semana 
// ========================

$semana = (int)(new DateTime($fechaHoraInicio))->format("W");

// ========================
// 10. Cálculo de la duración 
// ========================

$inicio = new DateTime($fechaHoraInicio);
$final  = new DateTime($fechaHoraFinal);

$segundosTotales = $final->getTimestamp() - $inicio->getTimestamp();

// ==============================
// 11. Tiempo de paro del reactor
// =============================

$numeroPrevio = $numeroProduccion - 1;

$sqlStoped = $pdo->prepare("SELECT Hora_Finalizacion 
                            FROM sulfato_terminadas
                            WHERE NumeroFabricacion = :num");
$sqlStoped->execute(['num' => $numeroPrevio]);
$Stoped = $sqlStoped->fetchColumn();

if ($Stoped && isset($Stoped)) {
    $HoraPrevia = new DateTime($Stoped);
} else {
    $HoraPrevia = null; // no hay producción anterior
}

// Calcular segundos desde la producción anterior
if ($HoraPrevia) {
    $inicio = new DateTime($fechaHoraInicio);
    $segundosDesdePrevio = $inicio->getTimestamp() - $HoraPrevia->getTimestamp();
} else {
    $segundosDesdePrevio = null;
}

$sqlInsert = $pdo->prepare("
    INSERT INTO sulfato_terminadas (
        Hora_Inicio, 
        Hora_Finalizacion, 
        Receta,
        Semana, 
        NumeroFabricacion, 
        Peso_Inicial, 
        Peso_Final, 
        Duracion, 
        Reactor, 
        Tiempo_Parado        
    ) VALUES (
        :horainicio, 
        :horafinalizacion, 
        :receta,
        :semana, 
        :numerofabricacion, 
        :pesoinicial, 
        :pesofinal, 
        :duracion, 
        :reactor, 
        :tiempoparado        
    )
");

// Ejecutar con los valores
/*$sqlInsert->execute([
    ':horainicio'       => $fechaHoraInicio,
    ':horafinalizacion' => $fechaHoraFinal,
    ':receta'           => $receta,
    ':semana'           => $semana,
    ':numerofabricacion'=> $numeroProduccion,
    ':pesoinicial'      => $pesoR,         // Peso inicial del reactor
    ':pesofinal'        => $pesoRF,        // Peso final del reactor
    ':duracion'         => $segundosTotales,
    ':reactor'          => $reactorNuevo,
    ':tiempoparado'     => $segundosDesdePrevio    
]);*/
} else {


// =============================
// 1. Obtener equipos actuales =
// =============================
$sqlOld = $pdo->prepare("
    SELECT Mezclador, Reactor
    FROM fabricaciones_en_curso
    WHERE NumeroFabricacion = :num
");

$sqlOld->execute([":num" => $numeroProduccion]);
$old = $sqlOld->fetch(PDO::FETCH_ASSOC);

if (!$old) {
    echo json_encode(["ok" => false, "error" => "Producción no encontrada"]);
    exit;
}

$mezcladorAnterior = $old["Mezclador"];
$reactorAnterior   = $old["Reactor"];

// ===============================
// 2. Liberar equipos anteriores =
// ===============================
$sqlFree = $pdo->prepare("
    UPDATE equipos SET Estado = 'Vacio'
    WHERE Equipo_id = :m OR Equipo_id = :r");
$sqlFree->execute([
    ":m" => $mezcladorAnterior,
    ":r" => $reactorAnterior
]);


// ======================================
// 4. Marcar nuevos equipos como En uso =
// ======================================
$sqlUse = $pdo->prepare("
    UPDATE equipos SET Estado = 'En uso'
    WHERE Equipo_id = :m OR Equipo_id = :r
");

$sqlUse->execute([
    ":m" => $mezcladorNuevo,
    ":r" => $reactorNuevo
]);

echo json_encode([
    "ok" => true,
    "modo" => $sqlUse
]); exit;

// ===========================
// 5. Actualizar la producción
// ===========================
$sqlUpdate = $pdo->prepare("
    UPDATE fabricaciones_en_curso
    SET Mezclador = :m,
        Reactor = :r,
        Receta = :receta,
        PesoInicialMezclador = :pm,
        PesoInicialReactor = :pr,
        PesoFinalReactor = :prf
    WHERE NumeroFabricacion = :num
");

$sqlUpdate->execute([
    ":m"    => $mezcladorNuevo,
    ":r"    => $reactorNuevo,
    ":receta" => $receta,
    ":pm"   => $pesoM,
    ":pr"   => $pesoR,
    ":prf"  => $pesoRF,
    ":num"  => $numeroProduccion
]);

}


// Devolver JSON
echo json_encode([
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
]); 

exit;







?> 