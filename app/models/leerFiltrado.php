<?php

ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);

require_once("miconexion.php");

function generarID()
{
    $ahora = date("d") . date("m") . date("Y") . date("H") . date("i");
    $ID = $ahora;
    return $ID;
}

$modo = $_POST["modo"] ?? "";

//echo json_encode(["FILE" => __FILE__,]); exit;


$sql = "SELECT * FROM mezclador_216";
$stmt = $conexion->prepare($sql);
$stmt->execute();
$m216 = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($m216) === 0) {
    echo json_encode([
        "LINE" => __LINE__,
        "M216" => "Nada que filtrar"
    ]);
    exit;
} else {

    $sql = "SELECT * FROM equipos WHERE Tipo = 'Depósito' AND ProductoFabricado = 'P18'";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $depositos = $stmt->fetchAll(PDO::FETCH_ASSOC);
}

if ($modo === "filtrar") {

    $id = generarID();
    $InsertSQL  = "INSERT INTO filtraciones_p18 
                  (ID_Filtracion, Fabricaciones, Volumen_Inicial, Volumen_Agua) 
                  VALUES (:id, :fab, :vi, :va)";

    $stmt = $conexion->prepare($InsertSQL);
    $stmt->bindParam(":id", $id);
    $stmt->bindParam(":fab", $fabricaciones);
    $stmt->bindParam(":vi", $volumeninicial);
    $stmt->bindParam(":va", $volumenagua);
    $stmt->execute();






    echo json_encode([
        "LINE" => __LINE__,
        "M216" => $m216,
        "Depositos" => $depositos
    ]);
} else {
    echo json_encode([
        "LINE" => __LINE__,
        "M216" => $m216,
        "Depositos" => $depositos
    ]);
}
