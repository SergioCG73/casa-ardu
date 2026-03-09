<?php
//ob_clean();
header('Content-Type: application/json; charset=utf-8'); //Le dice al navegador que la respuesta es un JSON
error_reporting(0);
ini_set('display_errors', 0);
        
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'ok' => false,
        'message' => 'Método no permitido'
    ]); exit;

}

require_once("miconexion.php");

    $numeroProduccion = $_POST["numeroProduccion"] ?? "";
    $fechaHoraInicio = $_POST["fechaHoraInicio"] ?? "";
    $mezclador = $_POST["mezclador"] ?? "";
    $pesoInicialMezclador = $_POST["pesoInicialMezclador"] ?? "";
    $receta = $_POST["receta"] ?? "";
    $sacas = $_POST["sacas"] ?? "";
    $producto = "Ferrico";

    if ($sacas === "on") {
        $sacas = 1;
    }
    else {
        $sacas = 0;
    }

/*echo json_encode([
    "sacas" => $sacas
]); exit;*/

    //Validación de datos recibidos
    try {
    //SQL para INSERT datos en fabricaciones_en_curso
        $insertSQL = "INSERT INTO fabricaciones_en_curso
                      (FechaInicio, Mezclador, PesoInicialMezclador, Receta, NumeroFabricacion, Producto_id, Sacas) 
                      VALUES (:fechaHoraInicio, :Mezclador, :PesoInicialMezclador, :Receta, :numeroProduccion, :Producto, :sacas)";

        $insertStmt = $conexion->prepare($insertSQL);
        $insertStmt->bindParam(":fechaHoraInicio", $fechaHoraInicio, PDO::PARAM_STR);
        $insertStmt->bindParam(":Mezclador", $mezclador, PDO::PARAM_STR);
        $insertStmt->bindParam(":PesoInicialMezclador", $pesoInicialMezclador, PDO::PARAM_INT);
        $insertStmt->bindParam(":Receta", $receta, PDO::PARAM_STR);
        $insertStmt->bindParam(":numeroProduccion", $numeroProduccion, PDO::PARAM_STR);
        $insertStmt->bindParam(":Producto", $producto, PDO::PARAM_STR);
        $insertStmt->bindParam(":sacas", $sacas, PDO::PARAM_INT);
        $insertStmt->execute();

    //SQL para UPDATE estados en la tabla equipos
    
        $updateSQL ="UPDATE equipos
                     SET Estado = 'En uso'
                     WHERE Equipo_id IN (:Mezclador)";

        $updateStmt = $conexion->prepare($updateSQL);        
        $updateStmt->bindParam(":Mezclador", $mezclador, PDO::PARAM_STR);
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
 
?>
