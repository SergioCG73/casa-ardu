<?php

//ob_clean();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . "/miconexion.php";
$pdo = $conexion;

// ===========================
// 1. Recoger datos del POST
// ===========================
$numeroProduccion     = $_POST["numeroProduccion"] ?? null;
$mezcladorNuevo       = $_POST["mezclador"] ?? null;
$receta               = $_POST["receta"] ?? null;
$pesoInicialMezclador = $_POST["pesoInicialMezclador"] ?? null;
$pesoFinalMezclador   = $_POST["pesoFinalMezclador"] ?? null;
$reactorNuevo         = $_POST["reactor"] ?? null;
$pesoInicialReactor   = $_POST["pesoInicialReactor"] ?? null;
$producto             = $_POST["producto"] ?? null;
$modo                 = $_POST["modo"] ?? null;
$pesoFinalReactor     = $_POST["pesoFinalReactor"] ?? null;

/*echo json_encode([
    "numeroProduccion" => $numeroProduccion,
    "receta" => $receta,
    "mezcladorNuevo" => $mezcladorNuevo,
    "pesoInicialMezclador" => $pesoInicialMezclador,
    "pesoFinalMezclador" => $pesoFinalMezclador,
    "reactorNuevo" => $reactorNuevo,
    "pesoInicialReactor" => $pesoInicialReactor,
    "reactor" => "null",
    "sql" => $actual    
    
]); exit; */






if (!$numeroProduccion) {
    echo json_encode(["ok" => false, "error" => "Falta numeroProduccion"]);
    exit;
}

// Corregir NaN si llega desde JS
if (!is_numeric($pesoFinalReactor))     $pesoFinalReactor = null;
if (!is_numeric($pesoFinalMezclador))   $pesoFinalMezclador = null;

// =====================================================
// RAMA 1: reactorNuevo === null
// =====================================================
if ($reactorNuevo === null) {
    
    $sql = $pdo->prepare("
        SELECT Mezclador, Reactor
        FROM fabricaciones_en_curso
        WHERE NumeroFabricacion = :num
    ");
    
    
    $sql->execute([":num" => $numeroProduccion]);
    $actual = $sql->fetch(PDO::FETCH_ASSOC);
    
    

    if (!$actual) {
        echo json_encode(["ok" => false, "error" => "Producción no encontrada"]);
        exit;
    }

    $mezcladorAnterior = $actual["Mezclador"];
    $reactorAnterior   = $actual["Reactor"];

    $pdo->beginTransaction();

    try {

        if ($mezcladorNuevo != $mezcladorAnterior) {

            $pdo->prepare("UPDATE equipos SET Estado='Vacio' WHERE Equipo_id=:id")
                ->execute([":id" => $mezcladorAnterior]);

            $pdo->prepare("UPDATE equipos SET Estado='En uso' WHERE Equipo_id=:id")
                ->execute([":id" => $mezcladorNuevo]);
        }

        $update = $pdo->prepare("
            UPDATE fabricaciones_en_curso
            SET 
                Mezclador = :mezclador,
                Reactor = :reactor,
                Receta = :receta,
                PesoInicialMezclador = :pm,
                PesoFinalMezclador = :pmf,
                PesoInicialReactor = :pr,
                PesoFinalReactor = :prf
            WHERE NumeroFabricacion = :num
        ");

        $update->execute([
            ":mezclador" => $mezcladorNuevo,
            ":reactor" => $reactorNuevo,
            ":receta" => $receta,
            ":pm" => $pesoInicialMezclador,
            ":pmf" => $pesoFinalMezclador,
            ":pr" => $pesoInicialReactor,
            ":prf" => $pesoFinalReactor,
            ":num" => $numeroProduccion
        ]);

        $pdo->commit();

        echo json_encode([
            "ok" => true,
            "message" => "Producción actualizada correctamente"
        ]);
        exit;
    } catch (Exception $e) {

        $pdo->rollBack();

        echo json_encode([
            "ok" => false,
            "error" => $e->getMessage()
        ]);
        exit;
    }
}

// =====================================================
// RAMA 2: reactorNuevo !== null
// =====================================================
$sql = $pdo->prepare("
    SELECT Mezclador, Reactor
    FROM fabricaciones_en_curso
    WHERE NumeroFabricacion = :num
");


/*echo json_encode([
    "POST2" => $_POST,
    "numeroProduccion" => $numeroProduccion,
    "receta" => $receta,
    "PesoInicialMezclador" => $pesoInicialMezclador,
    "mezclador" => $mezcladorNuevo,
    "reactor" => $reactorNuevo,
    "sql" => $sql
]); exit; 
exit;*/






$sql->execute([":num" => $numeroProduccion]);
$actual = $sql->fetch(PDO::FETCH_ASSOC);

if (!$actual) {
    echo json_encode(["ok" => false, "error" => "Producción no encontrada"]);
    exit;
}

$mezcladorAnterior = $actual["Mezclador"];
$reactorAnterior   = $actual["Reactor"];

$pdo->beginTransaction();

try {

    if ($reactorNuevo && $reactorNuevo != $reactorAnterior) {

        $check = $pdo->prepare("
            SELECT COUNT(*) 
            FROM fabricaciones_en_curso
            WHERE Reactor = :reactor
            AND NumeroFabricacion != :num
        ");
        $check->execute([
            ":reactor" => $reactorAnterior,
            ":num" => $numeroProduccion
        ]);

        $enUso = $check->fetchColumn();

        if ($enUso == 0) {
            $pdo->prepare("UPDATE equipos SET Estado='Vacio' WHERE Equipo_id=:id")
                ->execute([":id" => $reactorAnterior]);
        }

        $pdo->prepare("UPDATE equipos SET Estado='En uso' WHERE Equipo_id=:id")
            ->execute([":id" => $reactorNuevo]);
    }

    $update = $pdo->prepare("
        UPDATE fabricaciones_en_curso
        SET 
            Mezclador = :mezclador,
            Reactor = :reactor,
            Receta = :receta,
            PesoInicialMezclador = :pm,
            PesoFinalMezclador = :pmf,
            PesoInicialReactor = :pr,
            PesoFinalReactor = :prf
        WHERE NumeroFabricacion = :num
    ");

    $update->execute([
        ":mezclador" => $mezcladorNuevo,
        ":reactor" => $reactorNuevo,
        ":receta" => $receta,
        ":pm" => $pesoInicialMezclador,
        ":pmf" => $pesoFinalMezclador,
        ":pr" => $pesoInicialReactor,
        ":prf" => $pesoFinalReactor,
        ":num" => $numeroProduccion
    ]);

    $pdo->commit();

    echo json_encode([
        "ok" => true,
        "message" => "Producción actualizada correctamente"
    ]);
    exit;

} catch (Exception $e) {

    $pdo->rollBack();

    echo json_encode([
        "ok" => false,
        "error" => $e->getMessage()
    ]);
    exit;
}
