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
$tablaTerminadas = "sulfato_terminadas";

function obtenerUltimasFabricaciones($conexion, $producto, $tablaTerminadas)
{
    // Última terminada
    $sql = "SELECT NumeroFabricacion FROM $tablaTerminadas ORDER BY NumeroFabricacion DESC LIMIT 1";
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

    /*echo json_encode(["LINE" => __LINE__,
                      "ultimaAcabada" => $ultimaAcabada,
                      "ultimaEnCurso" => $ultimaEnCurso,
                      "ultimaSinFiltrar" => $ultimaSinFiltrar
    ]); exit;*/

    return [$ultimaAcabada, $ultimaEnCurso];
}

function obtenerDatosProducto($conexion, $producto)
{
    // Equipos    
    $numeroProduccion = $_POST["numeroProduccion"] ?? null;

    $sql = "SELECT Equipo_id, Estado, Tipo FROM equipos";
    $stmt = $conexion->prepare($sql);    
    $stmt->execute();
    $equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Recetas
    $sql = "SELECT NombreReceta FROM recetas WHERE ProductoFabricado = :producto";
    $stmt = $conexion->prepare($sql);
    $stmt->bindParam(":producto", $producto);
    $stmt->execute();
    $recetas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Reactores
    $sql = "SELECT * FROM equipos WHERE Tipo = 'Reactor' AND ProductoFabricado = :producto";
    $stmt = $conexion->prepare($sql);
    $stmt->bindParam(":producto", $producto);
    $stmt->execute();
    $reactores = $stmt->fetchAll(PDO::FETCH_ASSOC);

    //Notas
    $sql = "SELECT Notas FROM fabricaciones_en_curso WHERE NumeroFabricacion = :nf";
    $stmt = $conexion->prepare($sql);
    $stmt->bindParam(":nf", $numeroProduccion);
    $stmt->execute();
    $notas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /*echo json_encode(["LINE" => __LINE__,
                      "numeroProduccion" => $numeroProduccion,
                      "equipos" => $equipos,
                      "recetas" => $recetas, 
                      "reactores" => $reactores,
                      "notas" => $notas
        ]); exit;*/

    return [$equipos, $recetas, $reactores, $notas];
}

if (($modo === "editar" || $modo === "crear")) {
    $tabla = "sulfato_terminadas";
    list($ultimaAcabada, $ultimaEnCurso) = obtenerUltimasFabricaciones($conexion, $producto, $tabla);

    $siguienteFabricacion = ($modo === "crear")
        ? max($ultimaAcabada, $ultimaEnCurso, $ultimaSinFiltrar) + 1
        : max($ultimaAcabada, $ultimaEnCurso) + 1;

    //list($reactores, $recetas, $equipos, $notas) = obtenerDatosProducto($conexion, $producto);
    list($equipos, $recetas, $reactores, $notas) = obtenerDatosProducto($conexion, $producto);

    echo json_encode([
        "ultimaAcabada" => $ultimaAcabada,
        "ultimaEnCurso" => $ultimaEnCurso,
        "siguienteFabricacion" => $siguienteFabricacion,
        "equipos" => $equipos,
        "recetas" => $recetas,
        "reactores" => $reactores,
        "notas" => $notas,
        "linea" => __LINE__
    ]);
    exit;
}

if ($modo === "transferir") {
    $tabla = "sulfato_terminadas";
    list($ultimaAcabada, $ultimaEnCurso, $ultimaSinFiltrar) =  obtenerUltimasFabricaciones($conexion, $producto, $tabla);
    list($reactores, $recetas, $equipos) = obtenerDatosProducto($conexion, $producto);

    echo json_encode([
        "fichero" => __FILE__,        
        "modo" => $modo,
        "ultimaAcabada" => $ultimaAcabada,
        "ultimaEnCurso" => $ultimaEnCurso,
        "ultimaSinFiltrar" => $ultimaSinFiltrar,
        "reactores" => $reactores,
        "recetas" => $recetas,
        "equipos" => $equipos,
        "linea" => __LINE__
    ]);
    exit;
}



