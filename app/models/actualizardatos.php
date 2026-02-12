<?php
//ob_clean();
header('Content-Type: application/json; charset=utf-8');

error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["ok" => false, "error" => "Método no permitido"]);
    exit;
}

require_once __DIR__ . "/miconexion.php";

$pdo = $conexion;

// =========================
// 1. Recoger datos del POST
// =========================
$numeroProduccion   = $_POST["numeroProduccion"] ?? null;
$mezcladorNuevo     = $_POST["mezclador"] ?? null;
$reactorNuevo       = $_POST["reactor"] ?? null;
$receta             = $_POST["receta"] ?? null;
$pesoM              = $_POST["pesoInicialMezclador"] ?? null;
$pesoR              = $_POST["pesoInicialReactor"] ?? null;
$pesoRF             = $_POST["pesoFinalReactor"] ?? null;
$producto           = $_POST["producto"] ?? null;

if (!$numeroProduccion) {
    echo json_encode(["ok" => false,
                      "error" => "Falta numeroProduccion"]);
    exit;
}

// ===========================
// 2. Obtener equipos actuales
// ===========================
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

// =============================
// 3. Liberar equipos anteriores
// =============================
$sqlFree = $pdo->prepare("
    UPDATE equipos SET Estado = 'Vacio'
    WHERE Equipo_id = :m OR Equipo_id = :r");
$sqlFree->execute([
    ":m" => $mezcladorAnterior,
    ":r" => $reactorAnterior
]);

// ====================================
// 4. Marcar nuevos equipos como En uso
// ====================================
$sqlUse = $pdo->prepare("
    UPDATE equipos SET Estado = 'En uso'
    WHERE Equipo_id = :m OR Equipo_id = :r
");
$sqlUse->execute([
    ":m" => $mezcladorNuevo,
    ":r" => $reactorNuevo
]);

// ===========================
// 5. Actualizar la producción
// ===========================
$sqlUpdate = $pdo->prepare("
    UPDATE fabricaciones_en_curso
    SET Mezclador = :m,
        Reactor = :r,
        Receta = :receta,
        PesoInicialMezclador = :pm,
        PesoInicialReactor = :pr
    WHERE NumeroFabricacion = :num
");

$sqlUpdate->execute([
    ":m"    => $mezcladorNuevo,
    ":r"    => $reactorNuevo,
    ":receta" => $receta,
    ":pm"   => $pesoM,
    ":pr"   => $pesoR,
    ":num"  => $numeroProduccion
]);

echo json_encode([
    "ok" => true,
    "message" => "Producción actualizada correctamente"    
]);
exit;
?>