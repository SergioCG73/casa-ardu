<?php

//echo json_encode(["LINE" => __LINE__]); exit;     

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
//$fechaHoraInicio            = $_POST["fechaHoraInicio"] ?? null;
$mezcladorNuevo             = $_POST["mezclador"] ?? null;
$pesoM                      = $_POST["pesoInicialMezclador"] ?? null;
$pesoMF                     = $_POST["pesoFinalMezclador"] ?? null;
$reactorNuevo               = $_POST["reactor"] ?? null;
$pesoR                      = $_POST["pesoInicialReactor"] ?? null;
$pesoRF                     = $_POST["pesoFinalReactor"] ?? null;
$receta                     = $_POST["receta"] ?? null;
$producto                   = $_POST["producto"] ?? null;
$modo                       = $_POST["modo"] ?? null;
//$fechaInicioReaccion        = $_POST["fechaInicioReaccion"] ?? null;
$fechaHoraFinal             = $_POST["fechaHoraFinal"] ?? null;
$notas                      = $_POST["notas"] ?? null;
$tabla = "p18_terminadas";

//echo json_encode(["receta" => $receta]); exit;      

if (!$numeroProduccion) {
    echo json_encode([
        "ok" => false,
        "error" => "Falta numeroProduccion"
    ]);
    exit;
}

//=== 1ª TRANSFERENCIA (MEZCLADOR A REACTOR) ====

if ($pesoRF === null) {
    //echo json_encode(["LINE" => __LINE__]); exit;
    // Actualizar tabla fabricaciones_en_curso
    /* $sqlUpdate = $conexion->prepare("
        UPDATE fabricaciones_en_curso
        SET 
            FechaInicioReaccion = NOW(),
            PesoFinalMezclador = :pesoMF,
            Reactor = :reactor,
            PesoInicialReactor = :pesoR,
            Notas = :notas
        WHERE NumeroFabricacion = :nf");

    $sqlUpdate->execute([        
        ':pesoMF'             => $pesoMF,
        ':reactor'            => $reactorNuevo,
        ':pesoR'              => $pesoR,
        ':nf'                 => $numeroProduccion,
        ':notas'              => $notas
    ]);*/

    $sqlUpdate = $conexion->prepare("
        UPDATE fabricaciones_en_curso
        SET 
            Mezclador = :mezclador,
            PesoInicialMezclador = :pesoM,
            PesoFinalMezclador = :pesoMF,
            Reactor = :reactor,
            PesoInicialReactor = :pesoR,
            Receta = :receta,            
            Notas = :notas,
            FechaInicioReaccion = COALESCE(FechaInicioReaccion, NOW())
        WHERE NumeroFabricacion = :nf
    ");

    $sqlUpdate->execute([
        ':mezclador' => $mezcladorNuevo,
        ':pesoM'     => $pesoM,
        ':pesoMF'    => $pesoMF,
        ':reactor'   => $reactorNuevo,
        ':pesoR'     => $pesoR,
        ':receta'    => $receta,
        ':notas'     => $notas,
        ':nf'        => $numeroProduccion
    ]);

    //Actualizar mezcladores

    $sqlVaciarMezcladores = $conexion->prepare("
    UPDATE equipos 
    SET Estado = 'Vacio'
    WHERE Equipo_id IN ('M214', 'M215')
");
    $sqlVaciarMezcladores->execute();

    // Reactor → En uso
    $sqlUpdateReactor = $conexion->prepare("
        UPDATE equipos SET Estado = 'En uso'
            WHERE Equipo_id = :reactor
        ");

    $sqlUpdateReactor->execute([':reactor' => $reactorNuevo]);
} else if ($pesoRF !== null) {
    //echo json_encode(["LINE" => __LINE__]); exit;     

    //Insertar en P18_terminadas    
       $sqlInsert = $conexion->prepare("
    INSERT INTO p18_terminadas (
        NumeroFabricacion,
        Hora_Inicio,
        Hora_Finalizacion,
        Hora_Inicio_Reaccion,
        Semana,
        Mezclador,
        Peso_Inicial,
        Peso_Final_Mezclador,
        Peso_Inicial_Reactor,
        Peso_Final,
        Duracion,
        Reactor,
        Receta,
        Notas
    )
    VALUES (
        :nf,

        -- Hora_Inicio
        (SELECT FechaInicio
         FROM fabricaciones_en_curso
         WHERE NumeroFabricacion = :nf),

        -- Hora_Finalizacion
        NOW(),

        -- Hora_Inicio_Reaccion
        (SELECT FechaInicioReaccion
         FROM fabricaciones_en_curso
         WHERE NumeroFabricacion = :nf),

        -- Semana
        (
            SELECT 
                WEEK(FechaInicio, 1) + 
                CASE WHEN DAYOFWEEK(FechaInicio) = 1 THEN 1 ELSE 0 END
            FROM fabricaciones_en_curso
            WHERE NumeroFabricacion = :nf
        ),

        :mezclador,
        :pesoM,
        :pesoMF,
        :pesoR,
        :pesoRF,
        -- Duración en segundos
        (
            SELECT TIMESTAMPDIFF(
                SECOND,
                FechaInicio,
                NOW()
            )
            FROM fabricaciones_en_curso
            WHERE NumeroFabricacion = :nf
        ),
        :reactor,
        :receta,
        :notas
    )
");    

    $sqlInsert->execute([
        ':nf' => $numeroProduccion,
        ':mezclador' => $mezcladorNuevo,
        ':pesoM' => $pesoM,
        ':pesoMF' => $pesoMF,
        ':pesoR' => $pesoR,
        ':pesoRF' => $pesoRF,
        ':reactor' => $reactorNuevo,
        ':receta' => $receta,
        ':notas' => $notas
    ]);

    // Insertar en mezclador_216
    $sqlInsert = $conexion->prepare("INSERT INTO mezclador_216 (
                                                 NumeroFabricacion,
                                                 Volumen                                               
                                                )
                                            VALUES (:nf,
                                                    12500
                                            
                                                   )");


    $sqlInsert->execute([":nf" => $numeroProduccion]);

    // Reactor → Vacío
    $sqlUpdate = $conexion->prepare("UPDATE equipos SET Estado = 'Vacio' WHERE Equipo_id = :reactor");
    $sqlUpdate->execute([":reactor" => $reactorNuevo]);

    // Borrar fabricación en curso
    $sqlDelete = $conexion->prepare("DELETE FROM fabricaciones_en_curso WHERE NumeroFabricacion = :nf");
    $sqlDelete->execute([":nf" => $numeroProduccion]);
}

echo json_encode([
    "ok" => true,
    "mezclador" => $mezcladorNuevo,
    "pesoInicialMezclador" => $pesoM,
    "pesoFinalMezclador" => $pesoMF,
    "reactor" => $reactorNuevo,
    "pesoInicialReactor" => $pesoR,
    "pesoFinalReactor" => $pesoRF,
    "receta" => $receta,
    "numeroProduccion" => $numeroProduccion,
    "notas" => $notas,
    "mensaje" => "Transferencia Mezclador a Reactor"
]);
exit;
