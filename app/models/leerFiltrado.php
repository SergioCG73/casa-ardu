<?php

//echo json_encode(["FILE" => __FILE__,]); exit;

ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);

require_once("miconexion.php");

$modo = $_POST["modo"] ?? "";

//echo json_encode(["modo" => $modo]); exit;

if ($modo === "filtrado") {
    $sqlSelect = "SELECT * FROM mezclador_216";

    $stmt = $conexion->prepare($sqlSelect);
    $stmt->execute();
    $m216 = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Eliminar los registros = null
    $m216 = array_map(function ($fila) {
        return array_filter($fila, function ($valor) {
            return $valor !== null;
        });
    }, $m216);

    if (count($m216) === 0) {
        echo json_encode([
            "M216" => "Nada que filtrar"
        ]);
        exit;
    } else {
        $sql = "SELECT * FROM equipos WHERE Tipo = 'Depósito' AND ProductoFabricado = 'P18'";
        $stmt = $conexion->prepare($sql);
        $stmt->execute();
        $depositos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "Depositos" => $depositos,
            "M216" => $m216
        ]);
        exit;
    }
}

if ($modo === "editar") {
    //echo json_encode(["FILE" => __FILE__,]); exit;

    $sqlSelect = "SELECT * FROM fabricaciones_en_curso WHERE Producto_id = 'Filtrado'";
    $stmt = $conexion->prepare($sqlSelect);
    $stmt->execute();
    $filtraciones_en_curso = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Eliminamos los campos = null
    $filtraciones_en_curso = array_map(function ($fila) {   //Eliminar los registros  = NULL
        return array_filter($fila, function ($valor) {
            return $valor !== null;
        });
    }, $filtraciones_en_curso);

    //$sqlSelect = "SELECT * FROM equipos WHERE Tipo = 'Depósito' AND ProductoFabricado = 'P18' AND Estado = 'En uso'";
    $sqlSelect = "SELECT * FROM equipos WHERE Tipo = 'Depósito' AND ProductoFabricado = 'P18'";
    $stmt = $conexion->prepare($sqlSelect);
    $stmt->execute();
    $depositos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "filtraciones" => $filtraciones_en_curso,
        "Depositos" => $depositos
    ]);
    exit;
}

if ($modo === "transferir") {    
    $sqlSelect = "SELECT * FROM fabricaciones_en_curso WHERE Producto_id = 'Filtrado'";
    $stmt = $conexion->prepare($sqlSelect);
    $stmt->execute();
    $filtraciones_en_curso = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Eliminamos los campos = null
    $filtraciones_en_curso = array_map(function ($fila) {   //Eliminar los registros  = NULL
        return array_filter($fila, function ($valor) {
            return $valor !== null;
        });
    }, $filtraciones_en_curso);

    $sqlSelect = "SELECT * FROM equipos WHERE Tipo = 'Depósito' AND ProductoFabricado = 'P18'";
    $stmt = $conexion->prepare($sqlSelect);
    $stmt->execute();
    $depositos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "filtraciones" => $filtraciones_en_curso,
        "Depositos" => $depositos
    ]);
    exit;
}
