<?php

//echo json_encode(["FILE" => __FILE__]); exit;

ob_clean();
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);

require_once("miconexion.php");

$id = $_POST["id"];
$restos = $_POST["restos"] ?? 0;
$fabricaciones = $_POST["fabricaciones"] ?? null;
$volumenInicial = $_POST["vol_inicial_m216"] ?? null;
$volumenAgua = $_POST["vol_agua"] ?? null;
$deposito = $_POST["deposito"] ?? null;
$notas = $_POST["notas"] ?? null;
$densidad = $_POST["densidad"] ?? null;
$riqueza = $_POST["riqueza"] ?? null;
$valoracion = $_POST["valoracion"] ?? null;
$volDepFinal = $_POST["vol_dep_final"] ?? null;

$sqlInsert = "INSERT INTO filtraciones_p18 (
							ID_Filtracion,
							Fecha,
							Fabricaciones,
							Volumen_Inicial,
							Volumen_Agua,
							Restos,
							Deposito,
							Densidad,
							Riqueza,
							Basicidad,
							Valoracion,
							NotasLab
							)
					VALUES (
							:id,
							(SELECT FechaInicio 
							FROM fabricaciones_en_curso 
							WHERE NumeroFabricacion = :id
							LIMIT 1),
							:fabricaciones,
							:vi,
							:agua,
							:restos,
							:dep,
							(SELECT Densidad 
							FROM fabricaciones_en_curso
							WHERE NumeroFabricacion = :id
							LIMIT 1),
							(SELECT Riqueza
							FROM fabricaciones_en_curso
							WHERE NumeroFabricacion = :id
							LIMIT 1),
							(SELECT Basicidad
							FROM fabricaciones_en_curso
							WHERE NumeroFabricacion = :id
							LIMIT 1),
							(SELECT EstadoAnalitica
							FROM fabricaciones_en_curso
							WHERE NumeroFabricacion = :id
							LIMIT 1),
							:notas
							)";

$stmt = $conexion->prepare($sqlInsert);
$stmt->bindValue(":id", $id);
$stmt->bindParam(":fabricaciones", $fabricaciones);
$stmt->bindParam(":vi", $volumenInicial);
$stmt->bindParam(":agua", $volumenAgua);
$stmt->bindParam(":restos", $restos);
$stmt->bindParam(":dep", $deposito);
$stmt->bindParam(":notas", $notas);
$stmt->execute();

$sqlUpdateDeposito = "UPDATE equipos SET 
						Estado = 'Vacio',
						Volumen = :volumen
					 WHERE Equipo_id = :dep";
$stmt = $conexion->prepare($sqlUpdateDeposito);
$stmt->bindParam(":dep", $deposito);
$stmt->bindParam(":volumen", $volDepFinal);
$stmt->execute();

$sqlUpdateMezclador = "UPDATE equipos SET Estado = 'Vacio' WHERE Equipo_id = 'M216'";
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
}

echo json_encode([
	"ok" => true,
	"id" => $id,
	"fabricaciones" => $fabricaciones,
	"vol_inicial" => $volumenInicial,
	"vol_deposito" => $volDepFinal,
	"agua" => $volumenAgua,
	"restos" => $restos,
	"notas" => $notas
]);
exit;
