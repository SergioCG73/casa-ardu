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

    if ($producto === "P18" || $producto === "PP18") {
        $tabla = "p18_terminadas";
    } elseif ($producto === "Sulfato") {
        $tabla = "sulfato_terminadas";
        $producto = "Sulfato";
    } elseif ($producto === "Ferrico") {
        $tabla = "ferrico_terminadas";        
        $producto = "ferrico";        
    }      
    else {
        return ["ok" => false, "error" => "Producto no válido"];
    }

    //1) Última producción terminada
    $sqlSelect = "SELECT NumeroFabricacion 
            FROM $tabla
            ORDER BY NumeroFabricacion DESC 
            LIMIT 1";
    $stmt = $conexion->prepare($sqlSelect);
    $stmt->execute();
    $ultimaAcabada = $stmt->fetchColumn() ?? 0;

    //2) Última producción en curso
    $sqlSelect = "SELECT NumeroFabricacion
                  FROM  fabricaciones_en_curso
                  WHERE producto_id = :producto
                  ORDER BY NumeroFabricacion DESC
                  LIMIT 1
                  ";    
    
    $stmt = $conexion->prepare($sqlSelect);
    $stmt->bindParam(":producto", $producto, PDO::PARAM_STR);
    $stmt->execute();
    $ultimaEnCurso = $stmt->fetchColumn();    

    $siguienteFabricacion = max($ultimaAcabada, $ultimaEnCurso) + 1;    

    //3) Obtener los equipos del producto a fabricar

    $sqlSelect = "SELECT Equipo_id, Estado, Tipo FROM equipos
                  WHERE ProductoFabricado = :producto";

    $stmt = $conexion->prepare($sqlSelect);
    $stmt->bindParam(":producto", $producto, PDO::PARAM_STR);
    $stmt->execute();
    $equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);    

    //4) Obtener las recetas del producto

    $sqlSelect = "SELECT NombreReceta FROM recetas
                  WHERE ProductoFabricado = :producto";
    
    $stmt = $conexion->prepare($sqlSelect);
    $stmt->bindParam(":producto", $producto, PDO::PARAM_STR);
    $stmt->execute();
    $recetas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "ok" => true,
        "modo" => $modo,
        "producto" => $producto,
        "ultimaAcabada" => $ultimaAcabada,
        "ultimaEnCurso" => $ultimaEnCurso,
        "siguienteFabricacion" => $siguienteFabricacion,
        "equipos" => $equipos,
        "recetas" => $recetas
        
]); 

     
exit;
