<?php

ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);

require_once("miconexion.php");

// 1) Última producción terminada
    $sql = "SELECT NumeroFabricacion 
            FROM p18_terminadas 
            ORDER BY NumeroFabricacion DESC 
            LIMIT 1";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $ultimoNumero = $stmt->fetchColumn() ?? 0;    

// 2) Producciones en curso
    $sql = "SELECT * FROM fabricaciones_en_curso";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();    
    $producciones_en_curso = $stmt->fetchAll(PDO::FETCH_ASSOC);    

//3 Lista de mezcladores
        $sql = "SELECT * FROM equipos";
        $stmt = $conexion->prepare($sql);
        $stmt->execute();
        $lista_de_equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);

//4 Lista de recetas
        $sql = "SELECT * FROM recetas";
        $stmt = $conexion->prepare($sql);
        $stmt->execute();
        $litas_de_recetas = $stmt->fetchAll(PDO::FETCH_ASSOC);

 if (count($producciones_en_curso) === 0) {
        echo json_encode([
            "ok" => true,            
            "ultimoNumero" => $ultimoNumero,
            "producciones_en_curso" => [],
            "equipos" => $lista_de_equipos,
            "recetas" => $litas_de_recetas
        ]);
    }
    else {
        echo json_encode([
            "ok" => true,            
            "ultimoNumero" => $ultimoNumero,
            "producciones_en_curso" => $producciones_en_curso,
            "equipos" => $lista_de_equipos,
            "recetas" => $litas_de_recetas
        ]);
    }
     
exit;