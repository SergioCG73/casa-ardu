<?php

/*echo json_encode([
    "FILE" => __FILE__,
    "LINE" => __LINE__
]); exit;*/

ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);
require_once("miconexion.php");

//Evita que nos envíen datos por GET
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'ok' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

// Entrada combinada: JSON o POST
$input = json_decode(file_get_contents("php://input"), true);
$modo = $input["modo"] ?? $_POST["modo"] ?? null;
$producto = $input["producto"] ?? $_POST["producto"] ?? null;
$tabla = "hb10_terminadas";

/*echo json_encode([
    "input" => $input,                                  //null
    "modo" => $modo,                                    //crear
    "producto" => $producto,                            //hb10
    "tabla" => $tabla                                   //hb10_terminadas
]); exit;*/


// -----------------------------------------------
// FUNCIONES COMUNES A CREAR / EDITAR / TRANSFERIR
// -----------------------------------------------
function obtenerUltimasFabricaciones($conexion, $producto, $tabla)
{
    // Última terminada
    $sql = "SELECT NumeroFabricacion FROM $tabla ORDER BY NumeroFabricacion DESC LIMIT 1";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $ultimaAcabada = $stmt->fetchColumn() ?? 0;             //1009

    // Última en curso
    $sql = "SELECT NumeroFabricacion FROM fabricaciones_en_curso
            WHERE producto_id = :producto
            ORDER BY NumeroFabricacion DESC LIMIT 1";
    $stmt = $conexion->prepare($sql);
    $stmt->bindParam(":producto", $producto);
    $stmt->execute();
    $ultimaEnCurso = $stmt->fetchColumn() ?? 0;    

    return [$ultimaAcabada, $ultimaEnCurso];
}

list($ultimaAcabada, $ultimaEnCurso) = obtenerUltimasFabricaciones($conexion, $producto, $tabla);

function obtenerDatosProducto($conexion, $producto)
{
    $numeroProduccion = $_POST["numeroProduccion"] ?? null;

    // Equipos
    $sql = "SELECT Equipo_id, Estado, Tipo FROM equipos WHERE ProductoFabricado = :producto";
    $stmt = $conexion->prepare($sql);
    $stmt->bindParam(":producto", $producto, PDO::PARAM_STR);
    $stmt->execute();
    $equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Recetas
    $sql = "SELECT NombreReceta FROM recetas WHERE ProductoFabricado = :producto";
    $stmt = $conexion->prepare($sql);
    $stmt->bindParam(":producto", $producto);
    $stmt->execute();
    $recetas = $stmt->fetchAll(PDO::FETCH_ASSOC);    

    //Notas
    $sql = "SELECT Notas FROM fabricaciones_en_curso WHERE NumeroFabricacion = :nf";
    $stmt = $conexion->prepare($sql);
    $stmt->bindParam(":nf", $numeroProduccion);
    $stmt->execute();
    $notas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    return [$equipos, $recetas, $notas];
}


list ($equipos, $recetas, $notas) = obtenerDatosProducto($conexion, $producto);


echo json_encode([
    "LINE" => __LINE__,
    "ultimaAcabada" => $ultimaAcabada,
    "ultimaEnCurso" => $ultimaEnCurso,
    "equipos" => $equipos,
    "recetas" => $recetas,
    "notas" => $notas
]);
exit;
