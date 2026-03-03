<?php
ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["ok" => false, "error" => "Método no permitido"]);
    exit;
}

require_once("miconexion.php");
$pdo = $conexion;
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

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
    echo json_encode([
        "ok" => false,
        "error" => "Falta numeroProduccion"
    ]);
    exit;
}

/*echo json_encode([
    "fichero" => "transferirFabCurso.php",
    "modo" => $modo,
    "producto" => $producto,
    "pesoRf" => $pesoRF,
    "fechaInicioReaccion" => $fechaInicioReaccion
]); exit;*/

if ($modo === "transferir" && $producto === "P18" && $pesoRF === null) {
    // Actualizar tabla fabricaciones_en_curso
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
        ':horaInicioReaccion' => $fechaInicioReaccion,
        ':pesoMF'             => $pesoMF,
        ':reactor'            => $reactorNuevo,
        ':pesoR'              => $pesoR,
        ':numerofabricacion'  => $numeroProduccion,
    ]);

    // Mezclador → Vacío
    $sqlUpdateMezclador = $pdo->prepare("
        UPDATE equipos SET Estado = 'Vacio'
        WHERE Equipo_id = :mezclador
    ");
    $sqlUpdateMezclador->execute([':mezclador' => $mezcladorNuevo]);

    // Reactor → En uso
    $sqlUpdateReactor = $pdo->prepare("
        UPDATE equipos SET Estado = 'En uso'
        WHERE Equipo_id = :reactor
    ");
    $sqlUpdateReactor->execute([':reactor' => $reactorNuevo]);

    echo json_encode([
        "ok" => true,
        "modo" => $modo,
        "fechaHoraTransferencia" => $fechaHoraFinal,
        "mezclador" => $mezcladorNuevo,
        "pesoInicialMezclador" => $pesoM,
        "pesoFinalMezclador" => $pesoMF,
        "reactor" => $reactorNuevo,
        "pesoInicialReactor" => $pesoR,
        "receta" => $receta,
        "numeroProduccion" => $numeroProduccion,
        "producto" => $producto,
        "mensaje" => "Transferencia Mezclador a Reactor"
    ]);
    exit;
}


if ($modo === "transferir" && $producto === "P18" && $pesoRF != "") {
    // Semana
    $semana = (int)(new DateTime($fechaHoraInicio))->format("W");

    // Duración
    $inicio = new DateTime($fechaHoraInicio);
    $final  = new DateTime($fechaHoraFinal);
    $segundosTotales = $final->getTimestamp() - $inicio->getTimestamp();

    // Tiempo parado
    $numeroPrevio = $numeroProduccion - 1;

    $sqlStoped = $pdo->prepare("SELECT Hora_Finalizacion 
                                FROM p18_terminadas
                                WHERE NumeroFabricacion = :num");
    $sqlStoped->execute(['num' => $numeroPrevio]);
    $Stoped = $sqlStoped->fetchColumn();

    if ($Stoped) {
        $HoraPrevia = new DateTime($Stoped);
        $segundosDesdePrevio = $inicio->getTimestamp() - $HoraPrevia->getTimestamp();
        $HoraPreviaStr = $HoraPrevia->format("Y-m-d H:i:s");
    } else {
        $segundosDesdePrevio = null;
        $HoraPreviaStr = null;
    }

    // Actualizar fabricación en curso
    $sqlUpdate = $pdo->prepare("
        UPDATE fabricaciones_en_curso
        SET 
            FechaFinal = :horafinal,
            PesoFinalReactor = :pesofinal        
        WHERE NumeroFabricacion = :numerofabricacion
    ");

    $sqlUpdate->execute([
        ':horafinal'         => $fechaHoraFinal,
        ':pesofinal'         => $pesoRF,
        ':numerofabricacion' => $numeroProduccion
    ]);

    // Insertar en mezclador_216
    $sqlInsert = $pdo->prepare("INSERT INTO mezclador_216 (NumeroFabricacion, Fecha) VALUES (:nf, :fecha)");
    $sqlInsert->execute([":nf" => $numeroProduccion, ":fecha" => $fechaHoraFinal]);

    // Borrar fabricación en curso
    $sqlDelete = $pdo->prepare("DELETE FROM fabricaciones_en_curso WHERE NumeroFabricacion = :nf");
    $sqlDelete->execute([":nf" => $numeroProduccion]);

    // Reactor → Vacío
    $sqlUpdate = $pdo->prepare("UPDATE equipos SET Estado = 'Vacio' WHERE Equipo_id = :reactor");
    $sqlUpdate->execute([":reactor" => $reactorNuevo]);

    // Insertar en p18_terminadas
    $sqlInsert = $pdo->prepare("
    INSERT INTO p18_terminadas (
        Hora_Inicio,
        Hora_Finalizacion,
        Hora_Inicio_Reaccion,
        Semana,
        NumeroFabricacion,
        Mezclador,
        Peso_Inicial,
        Peso_Final_Mezclador,
        Peso_Inicial_Reactor,
        Peso_Final,
        Duracion,
        Reactor,
        Receta,
        Tiempo_Parado,
        Notas
    ) VALUES (
        :hi,
        :hf,
        :hir,
        :semana,
        :nf,
        :mezclador,
        :pM,
        :pMF,
        :pR,
        :pRF,
        :duracion,
        :reactor,
        :receta,
        :parado,
        :notas
    )
");


$sqlInsert->execute([
    ":hi"       => $fechaHoraInicio,
    ":hf"       => $fechaHoraFinal,
    ":hir"      => $fechaInicioReaccion,
    ":semana"   => $semana,
    ":nf"       => $numeroProduccion,
    ":mezclador"=> $mezcladorNuevo,
    ":pM"       => $pesoM,
    ":pMF"      => $pesoMF,
    ":pR"       => $pesoR,
    ":pRF"      => $pesoRF,
    ":duracion" => $segundosTotales,
    ":reactor"  => $reactorNuevo,
    ":receta"   => $receta,
    ":parado"   => $segundosDesdePrevio,
    ":notas"    => null   // o lo que corresponda
]);


    echo json_encode([
        "ok" => true,
        "mensaje" => "2º transferencia",
        "numeroProduccion" => $numeroProduccion,
        "producto" => $producto,
        "modo" => $modo,
        "fechaInicioMezcla" => $fechaHoraInicio,
        "fechaInicioReaccion" => $fechaInicioReaccion,
        "fechaHoraFinal" => $fechaHoraFinal,
        "pesoInicialMezclador" => $pesoM,
        "pesoFinalMezclador" => $pesoMF,
        "pesoInicialReactor" => $pesoR,
        "pesoFinalReactor" => $pesoRF,
        "reactor" => $reactorNuevo,
        "semana" => $semana,
        "duracion" => $segundosTotales,
        "parado" => $segundosDesdePrevio,
        "receta" => $receta,
        "HoraPrevia" => $HoraPreviaStr
    ]);
    exit;
}
