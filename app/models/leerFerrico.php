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
$tabla = "ferrico_terminadas";
//$numeroProduccion = $_POST["numeroProduccion "] ?? "";

//echo json_encode(["modo", $modo]); exit;

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

    return [$ultimaAcabada, $ultimaEnCurso];
}

function obtenerDatosProducto($conexion, $producto)
{
    // Mezcladores
    if ($producto === "Ferrico") {
        $numeroProduccion = $_POST["numeroFabricacion"];

        $sql = "SELECT Equipo_id, Estado, Tipo FROM equipos WHERE ProductoFabricado = :producto";
        $stmt = $conexion->prepare($sql);
        $stmt->bindParam(":producto", $producto);
        $stmt->execute();
        $equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        //Depósitos
        /*$sqlDep = "SELECT * FROM equipos WHERE ProductoFabricado = :producto AND Tipo = 'Deposito'";
        $stmt = $conexion->prepare($sqlDep);
        $stmt->bindParam(":producto", $producto);
        $stmt->execute();
        $depositos = $stmt->fetchAll(PDO::FETCH_ASSOC);*/

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

        return [$equipos, $recetas, $sacas, $notas];
    } else {
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

        return [$equipos, $recetas];
    }
}


if (($modo === "crear" || $modo === "editar")) {

    list($ultimaAcabada, $ultimaEnCurso) = obtenerUltimasFabricaciones($conexion, $producto, $tabla);

    $siguienteFabricacion = ($modo === "crear")
        ? max($ultimaAcabada, $ultimaEnCurso) + 1
        : max($ultimaAcabada, $ultimaEnCurso) + 1;

    list($equipos, $recetas, $sacas) = obtenerDatosProducto($conexion, $producto);

    echo json_encode([
        "ok" => true,
        "LINE" => __LINE__,
        "modo" => $modo,
        "producto" => $producto,
        "equipos" => $equipos,
        "recetas" => $recetas,
        "tabla" => $tabla,
        "ultimaAcabada" => $ultimaAcabada,
        "ultimaEnCurso" => $ultimaEnCurso,
        "sacas" => $sacas,
        "notas" => $notas
    ]);
    exit;
}

if ($modo === "transferir" || $modo === "terminar") {
    list($ultimaAcabada, $ultimaEnCurso) =  obtenerUltimasFabricaciones($conexion, $producto, $tabla);
    list($equipos, $recetas, $sacas, $notas) = obtenerDatosProducto($conexion, $producto);

    echo json_encode([
        "producto" => $producto,
        "modo" => $modo,
        "ultimaAcabada" => $ultimaAcabada,
        "ultimaEnCurso" => $ultimaEnCurso,
        "equipos" => $equipos,
        "recetas" => $recetas,
        "sacas" => $sacas,
        "notas" => $notas
    ]);
    exit;
}
