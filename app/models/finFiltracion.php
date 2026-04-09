<?php


//echo json_encode(["LINE" => __LINE__]); exit;

ob_clean();
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);

require_once("miconexion.php");

$id = $_POST["id"];
$restos = $_POST["restos"] ?? 0;
$restos = intval($restos);
$fabricaciones = $_POST["fabricaciones"] ?? null;
$volumenInicial = $_POST["volumenInicial"] ?? null;
$volumenAgua = $_POST["volumenAgua"] ?? null;
$deposito = $_POST["deposito"] ?? null;


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
/*$stmt->bindParam(":fab", $fabricaciones);
$stmt->bindParam(":vi", $volumenInicial);
$stmt->bindParam(":agua", $volumenAgua);
$stmt->bindParam(":restos", $restos);
$stmt->bindParam(":dep", $deposito);*/
$stmt->bindValue(":fab", $fabricaciones, PDO::PARAM_STR);
$stmt->bindValue(":vi", $volumenInicial, PDO::PARAM_STR);
$stmt->bindValue(":agua", $volumenAgua, PDO::PARAM_STR);
$stmt->bindValue(":restos", $restos, PDO::PARAM_INT);
$stmt->bindValue(":dep", $deposito, PDO::PARAM_STR);
$stmt->execute();

$sqlUpdateDeposito = "UPDATE equipos SET Estado = 'Vacio' WHERE Equipo_id = :dep";
$stmt = $conexion->prepare($sqlUpdateDeposito);
$stmt->bindParam(":dep", $deposito);
$stmt->execute();

$sqlUpdateMezclador = "UPDATE equipos SET Estado = 'Vacio' WHERE NombreEquipo = 'Mezclador M216'";
$stmt = $conexion->prepare($sqlUpdateMezclador);
$stmt->execute();

$sqlDelete = "DELETE FROM fabricaciones_en_curso WHERE NumeroFabricacion = :id";
$stmt = $conexion->prepare($sqlDelete);
$stmt->bindParam(":id", $id);
$stmt->execute();              

$sqlTruncate = "TRUNCATE mezclador_216";
$stmt = $conexion->prepare($sqlTruncate);
$stmt->execute();

if ($restos > 0) {
    
$sqlInsert = "INSERT INTO mezclador_216 (NumeroFabricacion, Volumen) VALUES (:id, :restos)";
$stmt = $conexion->prepare($sqlInsert);
$stmt->bindValue(":id", '0000', PDO::PARAM_STR);
$stmt->bindValue(":restos", $restos, PDO::PARAM_INT);
$stmt->execute();

//echo json_encode(["FILE" => __FILE__]); exit;

}

echo json_encode([
    "ok" => true,    
    "id" => $id,
    "Fabricaciones" => $fabricaciones,
    "VolumenInicial" => $volumenInicial,
    "VolumenAgua" => $volumenAgua,
    "restos" => $restos,
    "Deposito" => $deposito
]); exit;

?>
