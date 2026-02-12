<?php

//Este fichero recibe los datos enviados por AJAX desde index.js y los inserta en la tabla fab_en_curso

    //Prepara tu script PHP para responder JSON limpio y sin errores visibles.
    ob_clean(); //Limpia el buffer de salida
    header('Content-Type: application/json; charset=utf-8'); //Le dice al navegador que la respuesta es un JSON
    error_reporting(0); //Desactiva la salida de errores PHP
    ini_set('display_errors', 0); //Oculta los errores en pantalla

    //Comprueba los archivos de directorio actual models/
    /*
    echo json_encode([
    "dir_actual" => __DIR__,
    "archivos_en_models" => scandir(__DIR__)
    ]);
    exit;*/


    /*header('Content-Type: application/json');

    // Ruta al archivo
    $rutaConexion = __DIR__ . "/miconexion.php";

    if (!file_exists($rutaConexion)) {
                echo json_encode([
                "success" => false,
                "error" => "Archivo de conexión no encontrado",
                "detalle" => $rutaConexion
        ]);
        exit;
        }
    
        require_once($rutaConexion);

        echo json_encode([
            "success" => true,
            "message" => "Archivo existe y cargado"
        ]);*/
    


// Envio de datos a la tabla fabricaciones_en_curso
    //Verificar si los datos se recibieron desde AJAX    
        
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {        
    // Recoger los datos enviados por AJAX

    require_once("miconexion.php");

    $numeroProduccion = $_POST["numeroProduccion"] ?? "";
    $fechaHoraInicio = $_POST["fechaHoraInicio"] ?? "";
    $fechaHoraInicio = date("Y-m-d H:i:s", strtotime($_POST["fechaHoraInicio"]));
    $reactor = $_POST["reactor"] ?? "";
    $pesoInicialReactor = $_POST["pesoInicialReactor"] ?? "";    
    $receta = $_POST["receta"] ?? "";    
    $producto = "Sulfato";

    /*echo json_encode([
        "ok" => true,
        "numeroProduccion" => $numeroProduccion,
        "fechaHoraInicio" => $fechaHoraInicio,
        "reactor" => $reactor,
        "pesoInicialReactor" => $pesoInicialReactor,
        "receta" => $receta,
        "producto" => $producto
    ]); exit;*/


    //Validación de datos recibidos    
    if (
        empty($fechaHoraInicio) ||        
        empty($reactor) ||
        empty($receta) ||
        empty($numeroProduccion) ||                
        empty($pesoInicialReactor)    

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
                      (FechaInicio, Reactor, PesoInicialReactor, Receta, NumeroFabricacion, Producto_id) 
                      VALUES (:fechaHoraInicio, :Reactor, :PesoInicialReactor, :Receta, :numeroProduccion, :Producto)";

        $insertStmt = $conexion->prepare($insertSQL);
        $insertStmt->bindParam(":fechaHoraInicio", $fechaHoraInicio, PDO::PARAM_STR);        
        $insertStmt->bindParam(":Reactor", $reactor, PDO::PARAM_STR);
        $insertStmt->bindParam(":PesoInicialReactor", $pesoInicialReactor, PDO::PARAM_INT);
        $insertStmt->bindParam(":Receta", $receta, PDO::PARAM_STR);
        $insertStmt->bindParam(":numeroProduccion", $numeroProduccion, PDO::PARAM_STR);
        $insertStmt->bindParam(":Producto", $producto, PDO::PARAM_STR);        
        $insertStmt->execute();

    //SQL para UPDATE estados en la tabla equipos
    
        $updateSQL ="UPDATE equipos
                     SET Estado = 'En uso'
                     WHERE Equipo_id IN (:Reactor)";

        $updateStmt = $conexion->prepare($updateSQL);        
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
