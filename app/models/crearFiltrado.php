<?php

//echo json_encode(["FILE" => __FILE__]); exit;

ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);

require_once("miconexion.php");

// Recibir JSON
$json = file_get_contents("php://input");
$data = json_decode($json, true);

//$numeroFabricacion = $data["numeroFabricacion"] ?? null;
$densidad           = floatval($data["densidad"] ?? 0);
$riqueza            = floatval($data["riqueza"] ?? 0);
$basicidad          = floatval($data["basicidad"] ?? 0);
$observaciones      = $data["observaciones"] ?? null;
$filtradas          = $data["producciones"] ?? null;
$estado = null;
$producto = "P18";

$producciones = array_map("trim", explode("+", $filtradas));

$producciones = array_filter($producciones, function ($p) {
    return strtolower($p) !== "restos";
});


if ($densidad < 1.345 || $densidad > 1.35) {
    $estado = $estado  + 1;
}

if ($riqueza < 16 || $riqueza > 18) {
    $estado = $estado  + 2;
}

if ($basicidad < 35 || $basicidad > 45) {
    $estado = $estado  + 1;
}

function generarID()
{
    date_default_timezone_set("Europe/Madrid");
    $ID = date("dmYHi");
    return $ID;
}

$id = generarID();

/*echo json_encode([
    "densidad" => $densidad,
    "riqueza" => $riqueza,
    "basicidad" => $basicidad,
    "notas" => $observaciones,
    "filtradas" => $filtradas,
    "producciones" => $producciones,
    "estado" => $estado,
    "ID" => $id
]);
exit;*/

$InsertSQL = "INSERT INTO fabricaciones_en_curso (
                                NumeroFabricacion, 
                                Producto_id,
                                FechaInicio,
                                Mezclador, 
                                Fab_Filtradas,                                
                                Riqueza, 
                                Densidad,
                                Basicidad,
                                NotasLab,
                                EstadoAnalitica                                
                            )
                            VALUES (
                                :id,
                                'Filtrado',
                                NOW(),  
                                'M216',                              
                                :fab,                                
                                :riqueza,
                                :densidad,
                                :basicidad,
                                :observaciones,
                                :estado
                                )";

$stmt = $conexion->prepare($InsertSQL);
$stmt->bindParam(":id", $id);
$stmt->bindParam(":fab", $filtradas);
$stmt->bindParam(":riqueza", $riqueza);
$stmt->bindParam(":densidad", $densidad);
$stmt->bindParam(":basicidad", $basicidad);
$stmt->bindParam(":observaciones", $observaciones);
$stmt->bindParam(":estado", $estado);
$stmt->execute();

// Borrar tabla mezclador_216
$TruncateSQL = "TRUNCATE mezclador_216";
$stmt = $conexion->prepare($TruncateSQL);
$stmt->execute();

foreach ($producciones as $produccion) {

    $sql = "UPDATE p18_terminadas
            SET Densidad = :densidad,
                Riqueza = :riqueza,
                Basicidad = :basicidad
            WHERE NumeroFabricacion = :nf";

    $stmt = $conexion->prepare($sql);

    $stmt->bindParam(":densidad", $densidad);
    $stmt->bindParam(":riqueza", $riqueza);
    $stmt->bindParam(":basicidad", $basicidad);
    $stmt->bindParam(":nf", $produccion);
    $stmt->execute();
}

// Insertar en tabla: analíticas
$InsertSQL = "INSERT INTO analiticas
                    (ID_Analitica, Producto, Fecha, NumeroFabricacion, Densidad, Riqueza, Basicidad, NotasLab, Estado) 
                    VALUES
                    (:id, :producto, CURDATE(), :fab, :densidad, :riqueza, :basicidad, :observaciones, :estado)";

$stmt = $conexion->prepare($InsertSQL);
$stmt->bindParam(":id", $id);
$stmt->bindParam(":producto", $producto);
$stmt->bindParam(":fab", $filtradas);
$stmt->bindParam(":densidad", $densidad);
$stmt->bindParam(":riqueza", $riqueza);
$stmt->bindParam(":basicidad", $basicidad);
$stmt->bindParam(":observaciones", $observaciones);
$stmt->bindParam(":estado", $estado);
$stmt->execute();

echo json_encode([
    "ok" => true,
    "id" => $id,
    "filtradas" => $filtradas,
    "densidad" => $densidad,
    "riqueza" => $riqueza,
    "basicidad" => $basicidad,
    "notasLab" => $observaciones,
    "estado" => $estado,
    "message" => "Filtración creada correctamente"
]);
exit;
