<?php
    //Prepara tu script PHP para responder JSON limpio y sin errores visibles.
    ob_clean(); //Limpia el buffer de salida
    header('Content-Type: application/json; charset=utf-8'); //Le dice al navegador que la respuesta es un JSON
    error_reporting(0); //Desactiva la salida de errores PHP
    ini_set('display_errors', 0); //Oculta los errores en pantalla

    //Comprueba los archivos de directorio actual models/
    
    /*echo json_encode([
    "dir_actual" => __DIR__,
    "archivos_en_models" => scandir(__DIR__)
    ]);
    exit;*/

    if ($_SERVER['REQUEST_METHOD'] === "POST"){        
        //Recoger datos enviados por AJAX

        $mezclador = $_POST["mezclador"];

        header('Content-Type: application/json');

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

        $updateSQL = "UPDATE equipos
                      SET Estado = 'En uso'
                      WHERE Equipo_id IN (:Mezclador)";         


        echo json_encode([
            "success" => true,
            "message" => "Archivo existe y cargado",
            "mezclador" => $mezclador
        ]);
        exit;
    }

?>