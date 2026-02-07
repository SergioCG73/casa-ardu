<?php

ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);

require_once("miconexion.php");

$data = json_decode(file_get_contents("php://input"), true); //Convierte el string en un array asociativo
$modo = $data["modo"] ?? null;
$producto = $data["producto"] ?? null;

if ($modo === "inicial") {
    // 1) Producciones en curso
    $sql = "SELECT FechaInicio, Mezclador, PesoInicialMezclador, Reactor, PesoInicialReactor, 
                   Receta, NumeroFabricacion, Producto_id
            FROM fabricaciones_en_curso            
            ORDER BY NumeroFabricacion DESC";

    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $producciones_en_curso = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "ok" => true,
    "producciones_en_curso" => $producciones_en_curso
]); exit;

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

    // 6) Fecha transferencia SIEMPRE
    $sqlSelect = "SELECT FechaTransferenciaMezclador
                  FROM fabricaciones_en_curso
                  WHERE Producto_id = 'P18'
                  ORDER BY FechaTransferenciaMezclador DESC
                  LIMIT 1";

    $stmt = $conexion->prepare($sqlSelect);
    $stmt->execute();
    $fila = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($fila && !empty($fila['FechaTransferenciaMezclador'])) {
        $fechaTransferencia = date('Y-m-d H:i:s', strtotime($fila['FechaTransferenciaMezclador']));
    } else {
        $fechaTransferencia = date('Y-m-d H:i:s');
        $fechaTransferencia = null;
    }    

    // 7) Respuesta según haya o no producciones
    if (count($producciones_en_curso) === 0) {

        //Si no hay producciones en curso
        echo json_encode([
            "ok" => true,
            "producciones_en_curso" => [],            
            "mezcladoresP18Disponibles" => $mezcladoresDisponiblesP18,
            "mezcladoresP18Averiados" => $mezcladoresAveriadosP18,
            "reactoresP18Disponibles" => $reactoresDisponiblesP18,
            "reactoresP18Averiados" => $reactoresAveriadosP18,
            "fecha_transferencia_mezclador" => $fechaTransferencia
        ]);
        exit;
    }
    //Si hay producciones en curso
    echo json_encode([
        "ok" => true,
        "producciones_en_curso" => $producciones_en_curso,        
        "mezcladoresP18Disponibles" => $mezcladoresDisponiblesP18,
        "reactoresP18Disponibles" => $reactoresDisponiblesP18,
        "mezcladoresP18Averiados" => $mezcladoresAveriadosP18,
        "reactoresP18Averiados" => $reactoresAveriadosP18,
        "fecha_transferencia_mezclador" => $fechaTransferencia
    ]);
    exit;
}











