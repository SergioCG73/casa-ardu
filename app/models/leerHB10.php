<?php

/*echo json_encode([
    "file" => __FILE__
]); exit;*/

ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);

require_once("miconexion.php");

// Entrada combinada: JSON o POST
$input = json_decode(file_get_contents("php://input"), true);
$modo = $input["modo"] ?? $_POST["modo"] ?? null;
$producto = $input["producto"] ?? $_POST["producto"] ?? null;
$tabla = "hb10_terminadas";

// -----------------------------------------------
// FUNCIONES COMUNES A CREAR / EDITAR / TRANSFERIR
// -----------------------------------------------
function obtenerUltimasFabricaciones($conexion, $producto, $tabla)
{
    // Última terminada
    $sql = "SELECT NumeroFabricacion FROM $tabla ORDER BY NumeroFabricacion DESC LIMIT 1";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $ultimaAcabada = $stmt->fetchColumn() ?? 0;

    // Última en curso
    $sql = "SELECT NumeroFabricacion FROM fabricaciones_en_curso
            WHERE producto_id = :producto
            ORDER BY NumeroFabricacion DESC LIMIT 1";
    $stmt = $conexion->prepare($sql);
    $stmt->bindParam(":producto", $producto);
    $stmt->execute();
    $ultimaEnCurso = $stmt->fetchColumn() ?? 0;

    // Última sin filtrar (solo para CREAR)
    /*$sql = "SELECT MAX(NumeroFabricacion) FROM mezclador_216";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $ultimaSinFiltrar = $stmt->fetchColumn() ?? 0;*/

    return [$ultimaAcabada, $ultimaEnCurso];
}

list($ultimaAcabada, $ultimaEnCurso) = obtenerUltimasFabricaciones($conexion, $producto, $tabla);

/*echo json_encode([
    "LINE" => __LINE__,
    "ultimaAcabada" => $ultimaAcabada,
    "ultimaEnCurso" => $ultimaEnCurso
]);
exit;*/
