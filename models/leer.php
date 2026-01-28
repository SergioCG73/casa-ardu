<?php

ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);

require_once("miconexion.php");

$data = json_decode(file_get_contents("php://input"), true);
$modo = $data["modo"] ?? null;

if ($modo === "inicial") {

    // 1) Producciones en curso
    $sql = "SELECT FechaInicio, Mezclador, PesoInicialMezclador, Reactor,
                   Receta, NumeroFabricacion, Producto_id
            FROM fabricaciones_en_curso
            WHERE Producto_id = 'P18'
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

    // 7) Última producción terminada
   /* $sql = "SELECT NumeroFabricacion 
            FROM p18_terminadas 
            ORDER BY NumeroFabricacion DESC 
            LIMIT 1";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $ultimoNumero = $stmt->fetchColumn() ?? 0;    */

    // 8) Respuesta según haya o no producciones
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


// ===============================
// Última producción en curso
// ===============================
/*$sql = "SELECT NumeroFabricacion, FechaTransferenciaMezclador
        FROM fabricaciones_en_curso
        WHERE Producto_id = 'P18'
        ORDER BY NumeroFabricacion DESC
        LIMIT 1";

$stmt = $conexion->prepare($sql);
$stmt->execute();
$fila = $stmt->fetch(PDO::FETCH_ASSOC);*/   


//===================================
// Todas las producciones en curso
//===================================
/*        $sql = "SELECT FechaInicio, Mezclador, PesoInicialMezclador, Reactor,
                       Receta, NumeroFabricacion, Producto_id
                FROM fabricaciones_en_curso
                WHERE Producto_id = 'P18'
                ORDER BY NumeroFabricacion DESC";


$stmt = $conexion->prepare($sql);
$stmt-> execute();
$producciones_en_curso = $stmt->fetchAll(PDO::FETCH_ASSOC);*/

// Manejo de los datos devueltos en $fila
/*if ($fila) {
    $ultimoNumeroCurso = $fila['NumeroFabricacion'];
    $fechaTransferencia = $fila['FechaTransferenciaMezclador'];
} else {
    $ultimoNumeroCurso = 0;
    $fechaTransferencia = null;
}*/

// ===============================
// Cálculo seguro del último número
// ===============================
/*$ultimoNumero = max((int)$ultimoNumeroTerminada, (int)$ultimoNumeroCurso);*/

// ===========================================
// Coger la fecha de transferencia más antigua
// ===========================================

/*$sqlSelect = "SELECT FechaTransferenciaMezclador
                FROM fabricaciones_en_curso
                WHERE Producto_id = 'P18'
                ORDER BY FechaTransferenciaMezclador DESC
                LIMIT 1";

$stmt = $conexion -> prepare($sqlSelect);
$stmt->execute();
$fila = $stmt->fetch(PDO::FETCH_ASSOC);

if ($fila && !empty($fila['FechaTransferenciaMezclador'])) {
    $fechaTransferencia = date('Y-m-d H:i:s', strtotime($fila['FechaTransferenciaMezclador']));
} else {
    $fechaTransferencia = date('Y-m-d H:i:s'); // fecha actual
}*/

// ===============================
// Mezcladores
// ===============================
/*$sql = "SELECT Equipo_id, NombreEquipo, Estado
        FROM equipos 
        WHERE Tipo ='Mezclador' AND ProductoFabricado = 'P18'";

$stmt = $conexion->prepare($sql);
$stmt->execute();
$mezcladores = $stmt->fetchAll(PDO::FETCH_ASSOC);*/

// ===============================
// Reactores
// ===============================
/*$sql = "SELECT Equipo_id, NombreEquipo, ProductoFabricado, Estado
        FROM equipos
        WHERE Tipo = 'Reactor' AND Estado = 'Vacio'";*/

/*$sql = "SELECT Equipo_id, NombreEquipo, ProductoFabricado, Estado
        FROM equipos
        WHERE Tipo = 'Reactor' AND Estado = 'Vacio'";

$stmt = $conexion->prepare($sql);
$stmt->execute();
$reactores = $stmt->fetchAll(PDO::FETCH_ASSOC);*/

// ===============================
// Recetas
// ===============================
/*$sql = "SELECT Receta_id, NombreReceta
        FROM recetas
        WHERE ProductoFabricado = 'P18' AND Estado = 'En uso'";

$stmt = $conexion->prepare($sql);
$stmt->execute();
$recetas = $stmt->fetchAll(PDO::FETCH_ASSOC);*/

// ===============================
// Respuesta JSON única
// ===============================
/*echo json_encode([
    "ok" => true,    
    "ultimoNumero" => $ultimoNumero,
    "mezcladores" => $mezcladores,
    "reactores" => $reactores,
    "recetas" => $recetas,
    "fechaTransferencia" => $fechaTransferencia,
    "producciones_en_curso" => $producciones_en_curso
], JSON_UNESCAPED_UNICODE);

exit;*/
