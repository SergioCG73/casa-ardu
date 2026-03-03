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

echo json_encode([
        "ok" => true,
        "numeroProduccion" => $numeroProduccion,
        "fechaHoraInicio" => $fechaHoraInicio,
        "reactor" => $reactor,
        "pesoInicialReactor" => $pesoInicialReactor,
        "receta" => $receta,
        "producto" => $producto
]); exit;



require_once("miconexion.php");

 $numeroProduccion = $_POST["numeroProduccion"] ?? "";
$fechaHoraInicio = $_POST["fechaHoraInicio"] ?? "";    

    //$fechaHoraInicio = date("Y-m-d H:i:s", strtotime($_POST["fechaHoraInicio"]));
    $reactor = $_POST["reactor"] ?? "";
    $pesoInicialReactor = $_POST["pesoInicialReactor"] ?? "";    
    $receta = $_POST["receta"] ?? "";    
    $producto = "Sulfato";


    //Validación de datos recibidos    
   

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
 
?>
