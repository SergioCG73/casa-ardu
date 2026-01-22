<?php

//Este fichero recibe los datos enviados por AJAX desde index.js y los inserta en la tabla fab_en_curso

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

        /*$receta = $_POST["receta"] ?? 0;
        $numFabricacion = $_POST['numFabricacion'] ?? '';
        $producto = $_POST['producto'] ?? '';*/
       
       /* $respuesta = [
            "ok" => true,
            "datos" => $_POST
        ];

         header('Content-Type: application/json');
         echo json_encode($respuesta);         */

    //Validación de datos recibidos

    if (
    empty($fechaHoraInicio) ||
    empty($mezclador) ||
    empty($reactor) ||
    empty($receta) ||
    empty($numeroProduccion) ||
    empty($producto)
    ) {
    header('Content-Type: application/json');
    echo json_encode([
        'ok' => false,
        'message' => 'Faltan datos'
    ]);
    exit;
    }

    try {
        $insertSQL = "INSERT INTO fabricaciones_en_curso
                      (FechaInicio, Mezclador, Reactor, Receta, NumeroFabricacion, Producto_id)
                      VALUES (:fechaHoraInicio, :Mezclador, :Reactor, :Receta, :numeroProduccion, :Producto)";

        $insertStmt = $conexion->prepare($insertSQL);
        $insertStmt->bindParam(":fechaHoraInicio", $fechaHoraInicio, PDO::PARAM_STR);
        $insertStmt->bindParam(":Mezclador", $mezclador, PDO::PARAM_STR);
        $insertStmt->bindParam(":Reactor", $reactor, PDO::PARAM_STR);
        $insertStmt->bindParam(":Receta", $receta, PDO::PARAM_STR);
        $insertStmt->bindParam(":numeroProduccion", $numeroProduccion, PDO::PARAM_STR);
        $insertStmt->bindParam(":Producto", $producto, PDO::PARAM_STR);

        $insertStmt->execute();

        header('Content-Type: application/json');
        echo json_encode([
            'ok' => true,
            'message' => 'Datos guardados correctamente'
        ]);
        exit;

    } catch (PDOException $e) {

        header('Content-Type: application/json');
        echo json_encode([
            'ok' => false,
            'error' => $e->getMessage()
        ]);
        exit;
    }
    }      
 
?>
