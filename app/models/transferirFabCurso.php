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


if ($modo === "transferir" && $producto === "P18" && $pesoRF === null) {

// Actualizar tabla fabricaciones_en_curso con los nuevos datos al transferir
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

// Mezclador → Vacío
$sqlUpdateMezclador = $pdo->prepare("
    UPDATE equipos
    SET Estado = 'Vacio'
    WHERE  Equipo_id = :mezclador
");

$sqlUpdateMezclador->execute([
    ':mezclador' => $mezcladorNuevo
]);

// Reactor → En uso
$sqlUpdateReactor = $pdo->prepare("
    UPDATE equipos
    SET Estado = 'En uso'
    WHERE Equipo_id = :reactor
");

$sqlUpdateReactor->execute([
    ':reactor' => $reactorNuevo
]);

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
    "mensaje"                   => "Update  1 OK"
]); exit;

}








//-----------------------------------------------------------

if ($modo === "transferir" && $producto === "P18" && $pesoRF != "") {

echo json_encode([
    "ok" => true,
    "mensaje" => "2ª transferencia"
]); exit;

$sqlUpdate = $pdo->prepare("
    UPDATE fabricaciones_en_curso
    SET 
        FechaFinal = :horafinal,
        PesoFinalReactor = :pesofinal        
    WHERE NumeroFabricacion = :numerofabricacion
");

/*$sqlUpdate->execute([
    ':horafinal'         => $fechaHoraFinal,     
    ':pesofinal'         => $pesoRF,
    ':numerofabricacion' => $numeroProduccion
]);*/

$sqlInsert = $pdo->prepare("INSERT INTO fabricaciones_sin_filtrar (NumeroFabricacion, Fecha) VALUES (:nf, :fecha)");

/*$sqlInsert->execute([
    ":nf" => $numeroProduccion,
    ":fecha" => $fechaHoraFinal
]);*/


$sqlUpdate = $pdo->prepare("UPDATE equipos SET Estado = 'Vacio' WHERE Equipo_id = :reactor");

/*$sqlUpdate->execute([
    ":reactor" => $reactorNuevo
]);*/

$sqlDelete = $pdo->prepare("DELETE FROM fabricaciones_en_curso WHERE NumeroFabricacion = :nf");

/*$sqlDelete->execute([
    ":nf" => $numeroProduccion
]);*/

/*echo json_encode([
        "ok" => true,
        "FechaHoraFinal" => $fechaHoraFinal,        
        "PesoFinalReactor" => $pesoRF,
        "reactor" => $reactorNuevo,
        "NumeroFabricacion" => $numeroProduccion
]); exit;
};*/ 



}














//---------------------------------------------------------------------------------------------------


$sqlReactores = "SELECT * FROM equipos WHERE Tipo = 'Reactor' AND ProductoFabricado = 'P18'";
$stmt = $pdo->prepare($sqlReactores);
$stmt->execute();
$reactores = $stmt->fetchAll(PDO::FETCH_ASSOC);

/*if ($modo === 'transferir' && $producto === 'PP18') {
    echo json_encode([
        "ok" => true,
        "modo" => $modo,
        "producto" => $producto,
        "numeroProduccion" => $numeroProduccion,
        "receta" => $receta,
        "pesoInicialMezclador" => $pesoM,
        "pesoFinalMezclador" => $pesoMF,
        "reactores" => $reactores
    ]);   
    exit; 
}*/


// ========================
// 9. Cálculo de la semana 
// ========================

$semana = (int)(new DateTime($fechaHoraInicio))->format("W");

// ==========================
// 10. Cálculo de la duración 
// ==========================

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
$sqlInsert->execute([
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
]);

// Borrar fabricación en curso de la tabla fabricaciones_en_curso
$sqlDelete = $pdo->prepare( "DELETE FROM fabricaciones_en_curso WHERE NumeroFabricacion = :num");
$sqlDelete->execute([":num" => $numeroProduccion]);

// Actualizar estado del equipo utilizado
$sqlUpdate = $pdo->prepare("UPDATE equipos SET Estado = 'Vacio' WHERE Equipo_id = :reactor");
$sqlUpdate->execute([":reactor" => $reactorNuevo]); 

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


