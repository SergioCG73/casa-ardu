<?php
header('Content-Type: application/json; charset=utf-8');

require_once("miconexion.php");
$pdo = $conexion;

//echo json_encode(["FILE" => __FILE__]); exit;

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
$sacas                = $_POST["sacas"] ?? null;
$notas                = $_POST["notas"] ?? null;

if (!$numeroProduccion) {
    echo json_encode(["ok" => false, "error" => "Falta numeroProduccion"]);
    exit;
}

// Corregir NaN si llega desde JS
if (!is_numeric($pesoInicialReactor)) $pesoInicialReactor = null;
if (!is_numeric($pesoFinalReactor))     $pesoFinalReactor = null;
if (!is_numeric($pesoFinalMezclador))   $pesoFinalMezclador = null;

//echo json_encode(["pesoInicialReactor" => $pesoInicialReactor]); exit;

// =====================================================
// RAMA 1: reactorNuevo === null
// =====================================================
if ($reactorNuevo === null) {

    // Obtener valores anteriores
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

        // 3. Si cambia mezclador
        if ($mezcladorNuevo != $mezcladorAnterior) {

            $pdo->prepare("UPDATE equipos SET Estado='Vacio' WHERE Equipo_id=:id")
                ->execute([":id" => $mezcladorAnterior]);

            $pdo->prepare("UPDATE equipos SET Estado='En uso' WHERE Equipo_id=:id")
                ->execute([":id" => $mezcladorNuevo]);
        }

        // 5. Actualizar producción
        $update = $pdo->prepare("
            UPDATE fabricaciones_en_curso
            SET 
                Mezclador = :mezclador,
                Reactor = :reactor,
                Receta = :receta,
                PesoInicialMezclador = :pm,
                PesoFinalMezclador = :pmf,
                PesoInicialReactor = :pr,
                PesoFinalReactor = :prf,
                Sacas =:sacas,
                Notas =:notas
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
            ":num" => $numeroProduccion,
            ":sacas" => $sacas,
            ":notas" => $notas
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

// ==============================
// RAMA 2: reactorNuevo !== null
// ==============================

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

    // 4. Si cambia reactor
    if ($reactorNuevo && $reactorNuevo != $reactorAnterior) {
        
        // Comprobar si otro proceso sigue usando el reactor anterior
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

    // 5. Actualizar producción
    $update = $pdo->prepare("
        UPDATE fabricaciones_en_curso
        SET 
            Mezclador = :mezclador,
            Reactor = :reactor,
            Receta = :receta,
            PesoInicialMezclador = :pm,
            PesoFinalMezclador = :pmf,
            PesoInicialReactor = :pr,
            PesoFinalReactor = :prf,
            Sacas = :sacas,
            Notas = :notas
        WHERE NumeroFabricacion = :num
    ");
    
    /*echo json_encode(["LINE" => __LINE__,
                      "pesoInicialReactor" => $pesoInicialReactor
    ]); exit;*/

    $update->execute([
        ":mezclador" => $mezcladorNuevo,
        ":reactor" => $reactorNuevo,
        ":receta" => $receta,
        ":pm" => $pesoInicialMezclador,
        ":pmf" => $pesoFinalMezclador,
        ":pr" => $pesoInicialReactor,
        ":prf" => $pesoFinalReactor,
        ":num" => $numeroProduccion,
        ":sacas" => $sacas,
        ":notas" => $notas
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
