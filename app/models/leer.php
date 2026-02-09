<?php

ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);

require_once("miconexion.php");

// Entrada combinada: JSON o POST
$input = json_decode(file_get_contents("php://input"), true);
$modo = $input["modo"] ?? $_POST["modo"] ?? null;
$producto = $input["producto"] ?? $_POST["producto"] ?? null;

/* ============================================================
   FUNCIÓN AUXILIAR → devuelve lo que antes daba read.php
   ============================================================ */
function datosReadPHP($conexion, $producto) {

    if ($producto === "P18") {
        $tabla = "p18_terminadas";
    } elseif ($producto === "Sulfato") {
        $tabla = "sulfato_terminadas";
        $producto = "sulfato";
    } else {
        return ["ok" => false, "error" => "Producto no válido"];
    }

    // 1) Última producción terminada
    $sql = "SELECT NumeroFabricacion 
            FROM $tabla
            ORDER BY NumeroFabricacion DESC 
            LIMIT 1";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $ultimoNumero = $stmt->fetchColumn() ?? 0;

    // 2) Producciones en curso
    $sql = "SELECT * FROM fabricaciones_en_curso WHERE Producto_id = :prod";
    $stmt = $conexion->prepare($sql);
    $stmt->bindParam(":prod", $producto);
    $stmt->execute();
    $producciones_en_curso = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3) Lista de equipos
    $sql = "SELECT * FROM equipos";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $lista_de_equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4) Lista de recetas
    $sql = "SELECT * FROM recetas";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $lista_de_recetas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return [
        "ok" => true,
        "ultimoNumero" => $ultimoNumero,
        "producciones_en_curso" => $producciones_en_curso,
        "lista_de_equipos" => $lista_de_equipos,
        "lista_de_recetas" => $lista_de_recetas
    ];
}

/* ============================================================
   MODO: crear  → debe comportarse como read.php
   ============================================================ */
if ($modo === "crear") {
    echo json_encode(datosReadPHP($conexion, $producto));
    exit;
}

/* ============================================================
   MODO: editar → también debe comportarse como read.php
   ============================================================ */
if ($modo === "editar") {
    echo json_encode(datosReadPHP($conexion, $producto));
    exit;
}

/* ============================================================
   MODO: inicial  (contenido original de leer.php)
   ============================================================ */
if ($modo === "inicial") {

    // 1) Producciones en curso
    $sql = "SELECT FechaInicio, Mezclador, PesoInicialMezclador, Reactor, PesoInicialReactor, 
                   Receta, NumeroFabricacion, Producto_id
            FROM fabricaciones_en_curso            
            ORDER BY NumeroFabricacion DESC";

    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $producciones_en_curso = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2) Mezcladores disponibles
    $sql = "SELECT Equipo_id, NombreEquipo, Estado
            FROM equipos 
            WHERE Tipo ='Mezclador' AND ProductoFabricado = 'P18' AND Estado= 'Vacio'";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $mezcladoresDisponiblesP18 = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3) Mezcladores averiados
    $sql = "SELECT Equipo_id, NombreEquipo, Estado
            FROM equipos 
            WHERE Tipo ='Mezclador' AND ProductoFabricado = 'P18' AND Estado= 'Averiado'";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $mezcladoresAveriadosP18 = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4) Reactores disponibles
    $sql = "SELECT Equipo_id, NombreEquipo, Estado
            FROM equipos
            WHERE Tipo = 'Reactor' AND Estado = 'Vacio' AND ProductoFabricado = 'P18'";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $reactoresDisponiblesP18 = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 5) Reactores averiados
    $sql = "SELECT Equipo_id, NombreEquipo, Estado
            FROM equipos
            WHERE Tipo = 'Reactor' AND Estado = 'Averiado' AND ProductoFabricado = 'P18'";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $reactoresAveriadosP18 = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 6) Fecha transferencia
    $sqlSelect = "SELECT FechaTransferenciaMezclador
                  FROM fabricaciones_en_curso
                  WHERE Producto_id = 'P18'
                  ORDER BY FechaTransferenciaMezclador DESC
                  LIMIT 1";

    $stmt = $conexion->prepare($sqlSelect);
    $stmt->execute();
    $fila = $stmt->fetch(PDO::FETCH_ASSOC);

    $fechaTransferencia = $fila && !empty($fila['FechaTransferenciaMezclador'])
        ? date('Y-m-d H:i:s', strtotime($fila['FechaTransferenciaMezclador']))
        : null;

    echo json_encode([
        "ok" => true,
        "producciones_en_curso" => $producciones_en_curso,
        "mezcladoresP18Disponibles" => $mezcladoresDisponiblesP18,
        "mezcladoresP18Averiados" => $mezcladoresAveriadosP18,
        "reactoresP18Disponibles" => $reactoresDisponiblesP18,
        "reactoresP18Averiados" => $reactoresAveriadosP18,
        "fecha_transferencia_mezclador" => $fechaTransferencia
    ]);
    exit;
}

/* ============================================================
   MODO NO RECONOCIDO
   ============================================================ */
echo json_encode([
    "ok" => false,
    "error" => "Modo no reconocido"
]);
exit;

