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

/*echo json_encode([
    "FILE"  => __FILE__,
    "LINE" => __LINE__,
    "producto" => $producto
]); exit;*/

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


if ($modo === "transferir" && ($producto === "P18") && $pesoRF === null) {
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


if ($modo === "transferir" && ($producto === "P18" || $producto === "Sulfato") && $pesoRF != "") {

    switch ($producto) {
    case "P18":
        $tabla = "p18_terminadas";
        break;

    case "Sulfato":
        $tabla = "sulfato_terminadas";
        break;

    default:
        $tabla = null; // o lo que quieras usar como valor por defecto
        break;
}

    // Semana
    $semana = (int)(new DateTime($fechaHoraInicio))->format("W");

    // Duración
    $inicio = new DateTime($fechaHoraInicio);
    $final  = new DateTime($fechaHoraFinal);
    $segundosTotales = $final->getTimestamp() - $inicio->getTimestamp();

    // Tiempo parado
    $numeroPrevio = $numeroProduccion - 1;

    $sqlStoped = $pdo->prepare("SELECT Hora_Finalizacion 
                                FROM $tabla
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
    if ($producto === "P18") {
        $sqlInsert = $pdo->prepare("INSERT INTO mezclador_216 (NumeroFabricacion, Fecha) VALUES (:nf, :fecha)");
        $sqlInsert->execute([":nf" => $numeroProduccion, ":fecha" => $fechaHoraFinal]);
    }    

    // Borrar fabricación en curso
    $sqlDelete = $pdo->prepare("DELETE FROM fabricaciones_en_curso WHERE NumeroFabricacion = :nf");
    $sqlDelete->execute([":nf" => $numeroProduccion]);

    // Reactor → Vacío
    $sqlUpdate = $pdo->prepare("UPDATE equipos SET Estado = 'Vacio' WHERE Equipo_id = :reactor");
    $sqlUpdate->execute([":reactor" => $reactorNuevo]);

    // Definir columnas y parámetros según el producto
if ($producto === "P18") {
    $columnas = [
        "Hora_Inicio",
        "Hora_Finalizacion",
        "Hora_Inicio_Reaccion",
        "Semana",
        "NumeroFabricacion",
        "Mezclador",
        "Peso_Inicial",
        "Peso_Final_Mezclador",
        "Peso_Inicial_Reactor",
        "Peso_Final",
        "Duracion",
        "Reactor",
        "Receta",
        "Tiempo_Parado",
        "Notas"
    ];

    $valores = [
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
        ":notas"    => null
    ];

} elseif ($producto === "Sulfato") {

/*echo json_encode([
    "FILE"  => __FILE__,
    "LINE" => __LINE__,
    "numeroPrevio" => $numeroPrevio,    
    "Stoped" => $Stoped    
]); exit;*/

    $columnas = [
        "Hora_Inicio",
        "Hora_Finalizacion",
        "Receta",
        "Semana",
        "NumeroFabricacion",
        "Peso_Inicial",
        "Peso_Final",
        "Duracion",
        "Reactor",
        "Tiempo_Parado",
        "Notas"
    ];

    $valores = [
        ":hi"       => $fechaHoraInicio,
        ":hf"       => $fechaHoraFinal,
        ":receta"   => $receta,
        ":semana"   => $semana,
        ":nf"       => $numeroProduccion,
        ":pR"       => $pesoR,
        ":pRF"      => $pesoRF,
        ":duracion" => $segundosTotales,
        ":reactor"  => $reactorNuevo,
        ":parado"   => $segundosDesdePrevio,
        ":notas"    => null
    ];
} 

// Construir SQL automáticamente
$listaColumnas = implode(", ", $columnas);
$listaMarcadores = implode(", ", array_keys($valores));

$sqlInsert = $pdo->prepare("
    INSERT INTO $tabla ($listaColumnas)
    VALUES ($listaMarcadores)
");

$sqlInsert->execute($valores);

if ($producto === "P18") {
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
        "tabla" => $tabla,
        "HoraPrevia" => $HoraPreviaStr
    ]); exit;
} else if ($producto === "Sulfato") {
    echo json_encode([
        "ok" => true,
        "mensaje" => "transferencia Sulfato",
        "numeroProduccion" => $numeroProduccion,
        "producto" => $producto,
        "modo" => $modo,        
        "fechaInicio" => $fechaHoraInicio,
        "fechaHoraFinal" => $fechaHoraFinal,
        "pesoInicialReactor" => $pesoR,
        "pesoFinalReactor" => $pesoRF,
        "reactor" => $reactorNuevo,
        "semana" => $semana,
        "duracion" => $segundosTotales,
        "parado" => $segundosDesdePrevio,
        "receta" => $receta,
        "tabla" => $tabla,
        "HoraPrevia" => $HoraPreviaStr
]);    
}    
}
