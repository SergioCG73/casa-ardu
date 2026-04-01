<?php

ob_clean();
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["ok" => false, "error" => "Método no permitido"]);
    exit;
}

require_once("miconexion.php");


// ===========================
// 1. Recoger datos del POST =
// ===========================
$numeroProduccion           = $_POST["numeroProduccion"] ?? null;
$fechaHoraInicio            = $_POST["fechaHoraInicio"] ?? null;
$reactorNuevo               = $_POST["reactor"] ?? null;
$pesoR                      = $_POST["pesoInicialReactor"] ?? null;
$pesoRF                     = $_POST["pesoFinalReactor"] ?? null;
$receta                     = $_POST["receta"] ?? null;
$fechaHoraFinal             = $_POST["fechaHoraFinal"] ?? null;
$notas                      = $_POST["notas"] ?? null;
$tabla                      = "sulfato_terminadas";

if (!$numeroProduccion) {
    echo json_encode([
        "ok" => false,
        "error" => "Falta numeroProduccion"
    ]);
    exit;
}

//echo json_encode(["receta" => $receta]); exit;
$sqlInsert = "INSERT INTO sulfato_terminadas (
                     Hora_Inicio, 
                     Hora_Finalizacion,
                     Receta,
                     Semana,
                     NumeroFabricacion,
                     Peso_Inicial, 
                     Peso_Final,
                     Duracion,
                     Reactor,
                     Tiempo_Parado,
                     Notas)
              SELECT FechaInicio,
                     NOW(),
                     :receta,
                     WEEK(DATE_ADD(FechaInicio, INTERVAL 1 DAY), 1),
                     :nf,
                     :pesoR,
                     :pesoRF,
                     TIMESTAMPDIFF(SECOND, FechaInicio, NOW()),
                     :reactor,
                     TIMESTAMPDIFF(
                     SECOND,(
                        SELECT Hora_Finalizacion
                        FROM sulfato_terminadas
                        WHERE NumeroFabricacion < :nf
                        ORDER BY NumeroFabricacion DESC
                        LIMIT 1
                    ),
                    FechaInicio),
                     :notas
              FROM fabricaciones_en_curso
              WHERE NumeroFabricacion = :nf
              ";
$stmt = $conexion->prepare($sqlInsert);
$stmt->bindParam(":receta", $receta);
$stmt->bindParam(":nf", $numeroProduccion);
$stmt->bindParam(":pesoR", $pesoR);
$stmt->bindParam(":pesoRF", $pesoRF);
$stmt->bindParam(":reactor", $reactorNuevo);
$stmt->bindParam(":notas", $notas);
$stmt->execute();

// Reactor → Vacío
$sqlUpdate = "UPDATE equipos SET Estado = 'Vacio' WHERE Equipo_id = :reactor";
$stmt = $conexion->prepare($sqlUpdate);
$stmt->execute([":reactor" => $reactorNuevo]);

// Borrar fabricación en curso
$sqlDelete = "DELETE FROM fabricaciones_en_curso WHERE NumeroFabricacion = :nf";
$stmtDelete = $conexion->prepare($sqlDelete);
$stmtDelete->bindParam(":nf", $numeroProduccion);
$stmtDelete->execute();



echo json_encode([
    "ok" => true,
    "mensaje" => "transferencia Sulfato"
]);
exit;
