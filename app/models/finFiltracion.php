<?php


//echo json_encode(["LINE" => __LINE__]); exit;

ob_clean();
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);

require_once("miconexion.php");

$id = $_POST["id"];
$restos = $_POST["restos"] ?? 0;
$fabricaciones = $_POST["fabricaciones"] ?? null;
$volumenInicial = $_POST["volumenInicial"] ?? null;
$volumenAgua = $_POST["volumenAgua"] ?? null;
$deposito = $_POST["deposito"] ?? null;

$sqlInsert = "INSERT INTO mezclador_216 (NumeroFabricacion, Restos) VALUES (:id, :restos)";
$stmt = $conexion->prepare($sqlInsert);
$stmt->bindParam(":id", $id);
$stmt->bindParam(":restos", $restos);
//$stmt->execute();

/*echo json_encode([
    "ok" => true,    
    "id" => $id,
    "Fabricaciones" => $fabricaciones,
    "VolumenInicial" => $volumenInicial,
    "VolumenAgua" => $volumenAgua,
    "Restos" => $restos,
    "Deposito" => $deposito
]);
exit;*/              
$sqlInsert = "INSERT INTO filtraciones_p18 (
							ID_Filtracion,
							FechaInicio,
							FechaFin,
							Fabricaciones,
							Volumen_Inicial,
							Volumen_Agua,
							Restos,
							Deposito)
					VALUES (
							:id,
							(SELECT FechaInicio 
							FROM fabricaciones_en_curso 
							WHERE NumeroFabricacion = :id
							LIMIT 1),
							NOW(),
							:fab,
							:vi,
							:agua,
							:restos,
							:dep
							)";


$stmt = $conexion->prepare($sqlInsert);
$stmt->bindValue(":id", $id);
$stmt->bindParam(":fab", $fabricaciones);
$stmt->bindParam(":vi", $volumenInicial);
$stmt->bindParam(":agua", $volumenAgua);
$stmt->bindParam(":restos", $restos);
$stmt->bindParam(":dep", $deposito);
$stmt->execute();

$sqlUpdateDeposito = "UPDATE equipos SET Estado = 'Vacio' WHERE Equipo_id = :dep";
$stmt = $conexion->prepare($sqlUpdateDeposito);
$stmt->bindParam(":dep", $deposito);
$stmt->execute();

$sqlDelete = "DELETE FROM fabricaciones_en_curso WHERE NumeroFabricacion = :id";
$stmt = $conexion->prepare($sqlDelete);
$stmt->bindParam(":id", $id);
$stmt->execute();              




echo json_encode([
    "ok" => true,    
    "id" => $id,
    "Fabricaciones" => $fabricaciones,
    "VolumenInicial" => $volumenInicial,
    "VolumenAgua" => $volumenAgua,
    "restos" => $restos,
    "Deposito" => $deposito
]);
exit;

?>
