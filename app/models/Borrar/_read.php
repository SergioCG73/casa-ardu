<?php

ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);

require_once("miconexion.php");

$producto = $_POST["producto"] ?? null;
$modo = $_POST["modo"] ?? null;

if ($producto === "P18") {
    $tabla = "p18_terminadas";
}

if ($producto === "Sulfato") {
    $tabla = "sulfato_terminadas";
    $producto = "sulfato";
}

/*echo json_encode([
        "ok" => true,
        "modo" => $modo,
        "producto" => $producto,
        "tabla" => $tabla
]); exit;*/

// 1) Última producción terminada
    $sql = "SELECT NumeroFabricacion 
            FROM $tabla
            ORDER BY NumeroFabricacion DESC 
            LIMIT 1";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $ultimoNumero = $stmt->fetchColumn() ?? 0;

/*echo json_encode([
        "ok" => true,
        "modo" => $modo,
        "producto" => $producto, 
        "ultimoNumero" => $ultimoNumero
]); exit;*/


// 2) Producciones en curso
    $sql = "SELECT * FROM fabricaciones_en_curso WHERE Producto_id = :prod";
    $stmt = $conexion->prepare($sql);
    $stmt->bindParam(":prod", $producto);
    $stmt->execute();    
    $producciones_en_curso = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /*echo json_encode([
        "ok" => true,
        "modo" => $modo,
        "producto" => $producto, 
        "ultimoNumero" => $ultimoNumero,
         "producciones_en_curso" => $producciones_en_curso
    ]); exit;*/

//3 Lista de mezcladores
        $sql = "SELECT * FROM equipos";
        $stmt = $conexion->prepare($sql);
        $stmt->execute();
        $lista_de_equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /*echo json_encode([
        "ok" => true,
        "modo" => $modo,
        "producto" => $producto, 
        "ultimoNumero" => $ultimoNumero,
         "producciones_en_curso" => $producciones_en_curso,
         "lista_de_equipos" => $lista_de_equipos
    ]); exit;*/

    
//4 Lista de recetas
        $sql = "SELECT * FROM recetas";
        $stmt = $conexion->prepare($sql);
        $stmt->execute();
        $lista_de_recetas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    /*echo json_encode([
        "ok" => true,
        "modo" => $modo,
        "producto" => $producto, 
        "ultimoNumero" => $ultimoNumero,
        "producciones_en_curso" => $producciones_en_curso,
        "lista_de_equipos" => $lista_de_equipos,
        "lista_de_recetas" => $litas_de_recetas
    ]); exit;*/

 if (count($producciones_en_curso) === 0) {
        echo json_encode([
            "ok" => true,            
            "ultimoNumero" => $ultimoNumero,
            "producciones_en_curso" => [],
            "lista_de_equipos" => $lista_de_equipos,
            "lista_de_recetas" => $lista_de_recetas
        ]);
    }
    else {
        echo json_encode([
            "ok" => true,            
            "ultimoNumero" => $ultimoNumero,
            "producciones_en_curso" => $producciones_en_curso,
            "lista_de_equipos" => $lista_de_equipos,
            "lista_de_recetas" => $lista_de_recetas
        ]);
    }
     
exit;