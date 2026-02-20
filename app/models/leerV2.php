<?php

//ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);

require_once("miconexion.php");

// Entrada combinada: JSON o POST
$input = json_decode(file_get_contents("php://input"), true);
$modo = $input["modo"] ?? $_POST["modo"] ?? null;
$producto = $input["producto"] ?? $_POST["producto"] ?? null;  //Entra PP18

if($modo === "inicial") {

// 1) Producciones en curso
    //$sql = "SELECT * FROM fabricaciones_en_curso WHERE Producto_id = :prod";
    $sql = "SELECT * FROM fabricaciones_en_curso";
    $stmt = $conexion->prepare($sql);
    //$stmt->bindParam(":prod", $producto);
    $stmt->execute();
    $producciones_en_curso = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 2) Producciones en M216
    $sql = "SELECT NumeroFabricacion FROM fabricaciones_sin_filtrar";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $producciones_sin_filtrar = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Filtrar las que NO son "0000"
    $solo_fabricaciones = array_filter($producciones_sin_filtrar, function($fila) {
    return $fila["NumeroFabricacion"] !== "0000";
});

    // Contar
    $cantidad = count($solo_fabricaciones);

echo json_encode([
    "ok" => true,
    "modo" => $modo,
    "producto" => $producto,
    "producciones_en_curso" => $producciones_en_curso,
    "producciones_sin_filtrar" => $cantidad,
    "mensaje" =>"INICIAL"
]); exit;

}

if ($modo === "crear" && $producto === "P18") {
    $tabla = "p18_terminadas";

//2) Última producción terminada
$sqlSelect = "SELECT NumeroFabricacion 
        FROM $tabla
        ORDER BY NumeroFabricacion DESC 
        LIMIT 1";

$stmt = $conexion->prepare($sqlSelect);
$stmt->execute();
$ultimaAcabada = $stmt->fetchColumn() ?? 0;

//3) Última producción en curso
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

//4) Obtener los equipos del producto a fabricar
$sqlSelect = "SELECT Equipo_id, Estado, Tipo FROM equipos
             WHERE ProductoFabricado = :producto";

$stmt = $conexion->prepare($sqlSelect);
$stmt->bindParam(":producto", $producto, PDO::PARAM_STR);
$stmt->execute();
$equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);

//5) Obtener las recetas del producto
$sqlSelect = "SELECT NombreReceta FROM recetas
             WHERE ProductoFabricado = :producto";
    
$stmt = $conexion->prepare($sqlSelect);
$stmt->bindParam(":producto", $producto, PDO::PARAM_STR);
$stmt->execute();
$recetas = $stmt->fetchAll(PDO::FETCH_ASSOC);

//6) Obtener los reactores
$sqlReactores = "SELECT * FROM equipos WHERE Tipo = 'Reactor' AND ProductoFabricado = 'P18'";
$stmt = $conexion->prepare($sqlReactores);
$stmt->execute();
$reactores = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "ok" => true,
    "modo" => $modo,
    "producto" => $producto,
    "ultimaAcabada" => $ultimaAcabada,
    "ultimaEnCurso" => $ultimaEnCurso,
    "siguienteFabricacion" => $siguienteFabricacion,
    "equipos" => $equipos,
    "recetas" => $recetas,
    "reactores" => $reactores
]); exit;

}

if ($modo === "editar" && $producto === "P18") {
    $tabla = "p18_terminadas";

    //2) Última producción terminada
$sqlSelect = "SELECT NumeroFabricacion 
        FROM $tabla
        ORDER BY NumeroFabricacion DESC 
        LIMIT 1";

$stmt = $conexion->prepare($sqlSelect);
$stmt->execute();
$ultimaAcabada = $stmt->fetchColumn() ?? 0;

//3) Última producción en curso
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

//4) Obtener los equipos del producto a fabricar
$sqlSelect = "SELECT Equipo_id, Estado, Tipo FROM equipos
             WHERE ProductoFabricado = :producto";

$stmt = $conexion->prepare($sqlSelect);
$stmt->bindParam(":producto", $producto, PDO::PARAM_STR);
$stmt->execute();
$equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);

//5) Obtener las recetas del producto
$sqlSelect = "SELECT NombreReceta FROM recetas
             WHERE ProductoFabricado = :producto";
    
$stmt = $conexion->prepare($sqlSelect);
$stmt->bindParam(":producto", $producto, PDO::PARAM_STR);
$stmt->execute();
$recetas = $stmt->fetchAll(PDO::FETCH_ASSOC);

//6) Obtener los reactores
$sqlReactores = "SELECT * FROM equipos WHERE Tipo = 'Reactor' AND ProductoFabricado = 'P18'";
$stmt = $conexion->prepare($sqlReactores);
$stmt->execute();
$reactores = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "ok" => true,
    "modo" => $modo,
    "producto" => $producto,
    "ultimaAcabada" => $ultimaAcabada,
    "ultimaEnCurso" => $ultimaEnCurso,
    "siguienteFabricacion" => $siguienteFabricacion,
    "equipos" => $equipos,
    "recetas" => $recetas,
    "reactores" => $reactores
]); exit;

}; 

//3) Condición
if ($modo === "transferir" && $producto === "P18") {
    $tabla = "p18_terminadas";

//2) Última producción terminada
$sqlSelect = "SELECT NumeroFabricacion 
        FROM $tabla
        ORDER BY NumeroFabricacion DESC 
        LIMIT 1";

$stmt = $conexion->prepare($sqlSelect);
$stmt->execute();
$ultimaAcabada = $stmt->fetchColumn() ?? 0;

//3) Última producción en curso
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

//4) Obtener los equipos del producto a fabricar
$sqlSelect = "SELECT Equipo_id, Estado, Tipo FROM equipos
             WHERE ProductoFabricado = :producto";

$stmt = $conexion->prepare($sqlSelect);
$stmt->bindParam(":producto", $producto, PDO::PARAM_STR);
$stmt->execute();
$equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);

//5) Obtener las recetas del producto
$sqlSelect = "SELECT NombreReceta FROM recetas
             WHERE ProductoFabricado = :producto";
    
$stmt = $conexion->prepare($sqlSelect);
$stmt->bindParam(":producto", $producto, PDO::PARAM_STR);
$stmt->execute();
$recetas = $stmt->fetchAll(PDO::FETCH_ASSOC);

//6) Obtener los reactores
$sqlReactores = "SELECT * FROM equipos WHERE Tipo = 'Reactor' AND ProductoFabricado = 'P18'";
$stmt = $conexion->prepare($sqlReactores);
$stmt->execute();
$reactores = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "ok" => true,
    "modo" => $modo,
    "producto" => $producto,
    "ultimaAcabada" => $ultimaAcabada,
    "ultimaEnCurso" => $ultimaEnCurso,
    "siguienteFabricacion" => $siguienteFabricacion,
    "equipos" => $equipos,
    "recetas" => $recetas,
    "reactores" => $reactores,
    "tabla" => $tabla
]); exit;

};

//4) Condición

if (($modo === "crear" || $modo === "editar" || $modo === "transferir") && $producto === "PP18") {
if ($producto === "PP18") {
          $tabla = "p18_terminadas";
} elseif ($producto === "Sulfato") {
          $tabla = "sulfato_terminadas";
          $producto = "sulfato";
} elseif ($producto === "Ferrico") {
          $tabla = "ferrico_terminadas";        
          $producto = "ferrico";        
} 
else {
    return ["ok" => false, "error" => "Producto no válido"];
}

}

// 5) Condición

if ($modo === "filtrar") {

$sqlSelect = "SELECT NumeroFabricacion FROM fabricaciones_sin_filtrar " ;
$stmt = $conexion->prepare($sqlSelect);
$stmt->execute();
$fabricaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "ok" => true,
    "modo" => $modo,
    "fabricaciones" => $fabricaciones
]); exit;
}






//2) Última producción terminada
/*$sqlSelect = "SELECT NumeroFabricacion 
        FROM $tabla
        ORDER BY NumeroFabricacion DESC 
        LIMIT 1";

$stmt = $conexion->prepare($sqlSelect);
$stmt->execute();
$ultimaAcabada = $stmt->fetchColumn() ?? 0;

//3) Última producción en curso
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

//4) Obtener los equipos del producto a fabricar
$sqlSelect = "SELECT Equipo_id, Estado, Tipo FROM equipos
             WHERE ProductoFabricado = :producto";

$stmt = $conexion->prepare($sqlSelect);
$stmt->bindParam(":producto", $producto, PDO::PARAM_STR);
$stmt->execute();
$equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);

//5) Obtener las recetas del producto
$sqlSelect = "SELECT NombreReceta FROM recetas
             WHERE ProductoFabricado = :producto";
    
$stmt = $conexion->prepare($sqlSelect);
$stmt->bindParam(":producto", $producto, PDO::PARAM_STR);
$stmt->execute();
$recetas = $stmt->fetchAll(PDO::FETCH_ASSOC);

//6) Obtener los reactores
$sqlReactores = "SELECT * FROM equipos WHERE Tipo = 'Reactor' AND ProductoFabricado = 'P18'";
$stmt = $conexion->prepare($sqlReactores);
$stmt->execute();
$reactores = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "ok" => true,
    "modo" => $modo,
    "producto" => $producto,
    "ultimaAcabada" => $ultimaAcabada,
    "ultimaEnCurso" => $ultimaEnCurso,
    "siguienteFabricacion" => $siguienteFabricacion,
    "equipos" => $equipos,
    "recetas" => $recetas,
    "reactores" => $reactores
]); exit;*/





