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

// -----------------------------
// MODO INICIAL
// -----------------------------
if ($modo === "inicial") {
    // 1) Producciones en curso
    $sql = "SELECT * FROM fabricaciones_en_curso ORDER BY FechaInicio DESC";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $producciones_en_curso = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2) Volumen en M216
    /*$sql = "SELECT SUM(Volumen) AS TotalVolumen FROM mezclador_216";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $volumen_M216 = $result["TotalVolumen"] ?? 0;
    $volumen_M216 = intval($volumen_M216);*/

    $sql = "SELECT Volumen FROM equipos WHERE Equipo_id = 'M216'";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $volumen_M216 = intval($result["Volumen"]);

    // Filtrar las que NO son "0000"
    $solo_fabricaciones = array_filter(
        $producciones_en_curso,
        fn($fila) =>
        $fila["NumeroFabricacion"] !== "0000"
    );

    echo json_encode([
        "ok" => true,
        "modo" => $modo,
        "producto" => $producto,
        "producciones_en_curso" => $producciones_en_curso,
        "volumen_M216" => $volumen_M216
    ]);
    exit;
}

// -----------------------------------------------
// FUNCIONES COMUNES A CREAR / EDITAR / TRANSFERIR
// -----------------------------------------------
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

    if ($producto === "P18") {

        // Última sin filtrar (solo para CREAR)
        $sql = "SELECT MAX(NumeroFabricacion) FROM mezclador_216";
        $stmt = $conexion->prepare($sql);
        $stmt->execute();
        $ultimaSinFiltrar = $stmt->fetchColumn() ?? 0;
    } else {
        $ultimaSinFiltrar = 0;
    }

    echo json_encode([
        "LINE" => __LINE__,
        "ultimaAcabada" => $ultimaAcabada,
        "ultimaEnCurso" => $ultimaEnCurso,
        "ultimaSinFiltrar" => $ultimaSinFiltrar
    ]);
    exit;

    return [$ultimaAcabada, $ultimaEnCurso, $ultimaSinFiltrar];
}

function obtenerDatosProducto($conexion, $producto)
{
    // Equipos
    if ($producto === "Ferrico") {
        $numeroProduccion = $_POST["numeroProduccion"] ?? null;

        $sql = "SELECT Equipo_id, Estado, Tipo FROM equipos WHERE ProductoFabricado = :producto";
        $stmt = $conexion->prepare($sql);
        $stmt->bindParam(":producto", $producto);
        $stmt->execute();
        $mezcladores = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Recetas
        $sql = "SELECT NombreReceta FROM recetas WHERE ProductoFabricado = :producto";
        $stmt = $conexion->prepare($sql);
        $stmt->bindParam(":producto", $producto);
        $stmt->execute();
        $recetas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Sacas
        $sql = "SELECT Sacas FROM fabricaciones_en_curso WHERE Producto_id = :producto";
        $stmt = $conexion->prepare($sql);
        $stmt->bindParam(":producto", $producto);
        $stmt->execute();
        $sacas = $stmt->fetch(PDO::FETCH_ASSOC);

        //Notas
        $sql = "SELECT Notas FROM fabricaciones_en_curso WHERE NumeroFabricacion = :nf";
        $stmt = $conexion->prepare($sql);
        $stmt->bindParam(":nf", $numeroProduccion);
        $stmt->execute();
        $notas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "LINE" => __LINE__,
            "numeroProduccion" => $numeroProduccion,
            "notas" => $notas
        ]);
        exit;

        return [$mezcladores, $recetas, $sacas, $notas];
    } else {
        $numeroProduccion = $_POST["numeroProduccion"] ?? null;
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
}

if ($modo === "transferir" && $producto === "Sulfato") {
    $tabla = "sulfato_terminadas";
    list($ultimaAcabada, $ultimaEnCurso, $ultimaSinFiltrar) =  obtenerUltimasFabricaciones($conexion, $producto, $tabla);
    list($reactores, $recetas, $equipos) = obtenerDatosProducto($conexion, $producto);

    echo json_encode([
        "fichero" => __FILE__,
        "producto" => $producto,
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
} //Fin función obtenerDatosProducto()


if (($modo === "editar" || $modo === "crear") && $producto === "Sulfato") {
    $tabla = "sulfato_terminadas";
    list($ultimaAcabada, $ultimaEnCurso) = obtenerUltimasFabricaciones($conexion, $producto, $tabla);

    $siguienteFabricacion = ($modo === "crear")
        ? max($ultimaAcabada, $ultimaEnCurso, $ultimaSinFiltrar) + 1
        : max($ultimaAcabada, $ultimaEnCurso) + 1;

    list($reactores, $recetas, $equipos, $notas) = obtenerDatosProducto($conexion, $producto);

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

if ($modo === "transferir" && $producto === "Ferrico") {
    $tabla = "ferrico_terminadas";
    list($ultimaAcabada, $ultimaEnCurso) =  obtenerUltimasFabricaciones($conexion, $producto, $tabla);
    list($equipos, $recetas) = obtenerDatosProducto($conexion, $producto);

    echo json_encode([
        "fichero" => __FILE__,
        "producto" => $producto,
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

// -----------------------------------------------------------
// MODO CREAR / EDITAR / TRANSFERENCIA MEZCLADOR A REACTOR P18
// -----------------------------------------------------------
if (in_array($modo, ["crear", "editar", "transferir"]) && $producto === "P18") {
    $tabla = "p18_terminadas";

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

list($ultimaAcabada, $ultimaEnCurso) = obtenerUltimasFabricaciones($conexion, $producto, $tabla);

$siguienteFabricacion = ($modo === "crear")
    ? max($ultimaAcabada, $ultimaEnCurso) + 1
    : max($ultimaAcabada, $ultimaEnCurso) + 1;

if ($modo === "crear") {
    $siguienteFabricacion = max($ultimaAcabada, $ultimaEnCurso) + 1;
}

list($equipos, $recetas, $reactores) = obtenerDatosProducto($conexion, $producto);

echo json_encode([
    "prueba" => "SULFATO",
    "modo" => $modo,
    "producto" => $producto,
    "tabla" => $tabla,
    "Fabricacion" => $siguienteFabricacion,
    "recetas" => $recetas,
    "reactores" => $reactores,
    "equipos" => $equipos,
    "linea" => __LINE__
]);
exit;

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
