<?php
ob_clean();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . "/miconexion.php";
$pdo = $conexion;

// ===========================
// 1. Recoger datos del POST
// ===========================
$numeroProduccion     = $_POST["numeroProduccion"] ?? null;
$mezcladorNuevo       = $_POST["mezclador"] ?? null;
$reactorNuevo         = $_POST["reactor"] ?? null; // solo si lo envías
$receta               = $_POST["receta"] ?? null;
$pesoInicialMezclador = $_POST["pesoInicialMezclador"] ?? null;
$pesoFinalMezclador   = $_POST["pesoFinalMezclador"] ?? null;
$pesoInicialReactor   = $_POST["pesoInicialReactor"] ?? null;
$pesoFinalReactor     = $_POST["pesoFinalReactor"] ?? null;


/*echo json_encode([
    "ok" => true,
    "mensaje" => "POST_OK"
]); exit;*/


if (!$numeroProduccion) {
    echo json_encode(["ok"=>false,"error"=>"Falta numeroProduccion"]);
    exit;
}

// Corregir NaN si llega desde JS
if (!is_numeric($pesoFinalReactor)) {
    $pesoFinalReactor = null;
}

if (!is_numeric($pesoFinalMezclador)) {
    $pesoFinalMezclador = null;
}

// =============================
// 2. Obtener equipos actuales
// =============================
$sql = $pdo->prepare("
    SELECT Mezclador, Reactor
    FROM fabricaciones_en_curso
    WHERE NumeroFabricacion = :num
");
$sql->execute([":num"=>$numeroProduccion]);
$actual = $sql->fetch(PDO::FETCH_ASSOC);

if (!$actual) {
    echo json_encode(["ok"=>false,"error"=>"Producción no encontrada"]);
    exit;
}

$mezcladorAnterior = $actual["Mezclador"];
$reactorAnterior   = $actual["Reactor"];

$pdo->beginTransaction();

try {

    // =============================
    // 3. Si cambia mezclador
    // =============================
    if ($mezcladorNuevo != $mezcladorAnterior) {

        $pdo->prepare("UPDATE equipos SET Estado='Vacio' WHERE Equipo_id=:id")
            ->execute([":id"=>$mezcladorAnterior]);

        $pdo->prepare("UPDATE equipos SET Estado='En uso' WHERE Equipo_id=:id")
            ->execute([":id"=>$mezcladorNuevo]);
    }

    // =============================
    // 4. Si cambia reactor
    // =============================
    if ($reactorNuevo && $reactorNuevo != $reactorAnterior) {

        $pdo->prepare("UPDATE equipos SET Estado='Vacio' WHERE Equipo_id=:id")
            ->execute([":id"=>$reactorAnterior]);

        $pdo->prepare("UPDATE equipos SET Estado='En uso' WHERE Equipo_id=:id")
            ->execute([":id"=>$reactorNuevo]);
    }

    // =============================
    // 5. SIEMPRE actualizar producción
    // =============================
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
        ":mezclador"=>$mezcladorNuevo,
        ":reactor"=>$reactorNuevo,
        ":receta"=>$receta,
        ":pm"=>$pesoInicialMezclador,
        ":pmf"=>$pesoFinalMezclador,
        ":pr"=>$pesoInicialReactor,
        ":prf"=>$pesoFinalReactor,
        ":num"=>$numeroProduccion
    ]);

    $pdo->commit();

    echo json_encode([
    "ok" => true,
    "pesoFinalMezclador2" => $pesoFinalMezclador 
    ]); exit;

    echo json_encode([
        "ok"=>true,
        "message"=>"Producción actualizada correctamente"
    ]);

} catch (Exception $e) {

    $pdo->rollBack();

    echo json_encode([
        "ok"=>false,
        "error"=>$e->getMessage()
    ]);
}

exit;
