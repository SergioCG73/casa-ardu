<?php

//Este fichero recibe los datos enviados por AJAX desde index.js y los inserta en la tabla fab_en_curso

    //Prepara tu script PHP para responder JSON limpio y sin errores visibles.
    ob_clean(); //Limpia el buffer de salida
    header('Content-Type: application/json; charset=utf-8'); //Le dice al navegador que la respuesta es un JSON
    error_reporting(0); //Desactiva la salida de errores PHP
    ini_set('display_errors', 0); //Oculta los errores en pantalla

// Envio de datos a la tabla fabricaciones_en_curso
    //Verificar si los datos se recibieron desde AJAX    
        
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {        
    // Recoger los datos enviados por AJAX

    require_once("miconexion.php");
    $fechaHoraInicio = $_POST["fechaHoraInicio"] ?? "";        
    $mezclador = $_POST["mezclador"] ?? "";
    $reactor = $_POST["reactor"] ?? "";
    $receta = $_POST["receta"] ?? "";
    $numeroProduccion = $_POST["numeroProduccion"] ?? "";
    $producto = $_POST["producto"] ?? "";
    $pesoInicialMezclador = $_POST["pesoInicialMezclador"]; //NUEVO

    //Validación de datos recibidos

    if (
        empty($fechaHoraInicio) ||
        empty($mezclador) ||
        empty($reactor) ||
        empty($receta) ||
        empty($numeroProduccion) ||
        empty($producto) ||
        empty($pesoInicialMezclador) //NUEVO
    ) {
        header('Content-Type: application/json');
        echo json_encode([
            'ok' => false,
            'message' => 'Faltan datos'
    ]);
        exit;
    }    

    try {
    //SQL para INSERT datos en fabricaciones_en_curso
        $insertSQL = "INSERT INTO fabricaciones_en_curso
                      (FechaInicio, Mezclador, PesoInicialMezclador, Reactor, Receta, NumeroFabricacion, Producto_id) 
                      VALUES (:fechaHoraInicio, :Mezclador, :PesoInicialMezclador, :Reactor, :Receta, :numeroProduccion, :Producto)";

        $insertStmt = $conexion->prepare($insertSQL);
        $insertStmt->bindParam(":fechaHoraInicio", $fechaHoraInicio, PDO::PARAM_STR);
        $insertStmt->bindParam(":Mezclador", $mezclador, PDO::PARAM_STR);
        $insertStmt->bindParam(":PesoInicialMezclador", $pesoInicialMezclador, PDO::PARAM_INT);//NUEVO
        $insertStmt->bindParam(":Reactor", $reactor, PDO::PARAM_STR);
        $insertStmt->bindParam(":Receta", $receta, PDO::PARAM_STR);
        $insertStmt->bindParam(":numeroProduccion", $numeroProduccion, PDO::PARAM_STR);
        $insertStmt->bindParam(":Producto", $producto, PDO::PARAM_STR);

        $insertStmt->execute();

    //SQL para UPDATE estados en la tabla equipos
    
        $updateSQL ="UPDATE equipos
                     SET Estado = 'En uso'
                     WHERE Equipo_id IN (:Mezclador, :Reactor)";

        $updateStmt = $conexion->prepare($updateSQL);
        $updateStmt->bindParam(":Mezclador", $mezclador, PDO::PARAM_STR);
        $updateStmt->bindParam(":Reactor", $reactor, PDO::PARAM_STR);

        $updateStmt->execute();
        
        echo json_encode([
            "ok" => true,
            "message" => "Datos guardados correctamente"
        ]);
        exit;

    } catch (PDOException $e) {        
        echo json_encode([
            "ok"=> false,
            "error" => $e->getMessage()
        ]);
        exit;
    }
    }
 
?>
