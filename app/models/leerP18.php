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
$tabla = "p18_terminadas";

// -----------------------------------------------
// FUNCIONES COMUNES A CREAR / EDITAR / TRANSFERIR
// -----------------------------------------------
function obtenerUltimasFabricaciones($conexion, $producto, $tablaTerminadas) {
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

    // Última sin filtrar (solo para CREAR)
    $sql = "SELECT MAX(NumeroFabricacion) FROM mezclador_216";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $ultimaSinFiltrar = $stmt->fetchColumn() ?? 0;

    /*echo json_encode([
        "LINE" => __LINE__,
        "ultimaAcabada" => $ultimaAcabada,
        "ultimaEnCurso" => $ultimaEnCurso,
        "ultimaSinFiltrar" => $ultimaSinFiltrar
    ]);
    exit;*/

    return [$ultimaAcabada, $ultimaEnCurso, $ultimaSinFiltrar];
}

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

function obtenerDatosProduccionEnCurso($conexion)
{
    $numeroProduccion = $_POST["numeroProduccion"] ?? null;

    // Produccion en curso
    $sqlSelect = "SELECT * FROM fabricaciones_en_curso WHERE NumeroFabricacion = :nf";
    $stmt = $conexion->prepare($sqlSelect);
    $stmt->bindParam(":nf", $numeroProduccion);
    $stmt->execute();
    $produccionCurso = $stmt->fetch(PDO::FETCH_ASSOC);

    /*    echo json_encode(["produccionCurso" => $produccionCurso]);
    exit;*/


    return $produccionCurso;
}



// -----------------------------------------------------------
// MODO CREAR / EDITAR / TRANSFERENCIA MEZCLADOR A REACTOR P18
// -----------------------------------------------------------
if (in_array($modo, ["crear", "editar", "transferir"])) {
    list($ultimaAcabada, $ultimaEnCurso, $ultimaSinFiltrar) =
        obtenerUltimasFabricaciones($conexion, $producto, $tabla);

    // EDITAR y TRANSFERIR no usan sin filtrar
    $siguienteFabricacion = ($modo === "crear")
        ? max($ultimaAcabada, $ultimaEnCurso, $ultimaSinFiltrar) + 1
        : max($ultimaAcabada, $ultimaEnCurso) + 1;

    list($equipos, $recetas, $reactores) = obtenerDatosProducto($conexion, $producto);

    echo json_encode([
        "ok" => true,
        "modo" => $modo,
        "producto" => $producto,
        "ultimaAcabada" => $ultimaAcabada,
        "ultimaEnCurso" => $ultimaEnCurso,
        "ultimaSinFiltrar" => $ultimaSinFiltrar,
        "siguienteFabricacion" => $siguienteFabricacion,
        "equipos" => $equipos,
        "recetas" => $recetas,
        "reactores" => $reactores,
        "tabla" => $tabla,
        "pesoInicialMezclador" => $pesoInicialMezclador,
        "linea" => __LINE__
    ]);
    exit;
}


/*

list($ultimaAcabada, $ultimaEnCurso) = obtenerUltimasFabricaciones($conexion, $producto, $tabla);

$siguienteFabricacion = ($modo === "crear")
    ? max($ultimaAcabada, $ultimaEnCurso) + 1
    : max($ultimaAcabada, $ultimaEnCurso) + 1;

if ($modo === "crear") {
    $siguienteFabricacion = max($ultimaAcabada, $ultimaEnCurso) + 1;
}

list($equipos, $recetas, $reactores) = obtenerDatosProducto($conexion, $producto);

echo json_encode([
    "modo" => $modo,
    "producto" => $producto,
    "tabla" => $tabla,
    "Fabricacion" => $siguienteFabricacion,
    "recetas" => $recetas,
    "reactores" => $reactores,
    "equipos" => $equipos,
    "linea" => __LINE__
]);
exit;*/

// MODO TERMINAR
if ($modo === "terminar") {
    list($ultimaAcabada, $ultimaEnCurso, $ultimaSinFiltrar) = obtenerUltimasFabricaciones($conexion, $producto, $tabla);
    list($equipos, $recetas, $reactores) = obtenerDatosProducto($conexion, "P18");

    $produccionCurso = obtenerDatosProduccionEnCurso($conexion);

    echo json_encode([
        "ok" => true,        
        "numeroProduccion" => $numeroProduccion,
        "produccionCurso" => $produccionCurso,
        "equipos" => $equipos,
        "recetas" => $recetas,
        "reactores" => $reactores       
    ]);
    exit;
    
}


// -----------------------------
// MODO FILTRAR
// -----------------------------
if ($modo === "filtrar") {

    $sqlSelect = "SELECT NumeroFabricacion FROM mezclador_216";
    $stmt = $conexion->prepare($sqlSelect);
    $stmt->execute();
    $fabricaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $sqlSelect = "SELECT * FROM equipos WHERE Tipo = 'Depósito' AND ProductoFabricado = 'P18'";
    $stmt = $conexion->prepare($sqlSelect);
    $stmt->execute();
    $depositos = $stmt->fetchAll(PDO::FETCH_ASSOC);


    echo json_encode([
        "ok" => true,
        "modo" => $modo,
        "fabricaciones" => $fabricaciones,
        "depositos" => $depositos,
        "linea" => __LINE__
    ]);
    exit;
}
