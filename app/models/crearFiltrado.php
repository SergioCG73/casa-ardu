<?php 

ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);

require_once("miconexion.php");

$fabricaciones = $_POST["fabricaciones"] ?? "";
$volumenInicial = (integer)($_POST["vol_inicial_m216"] ?? 0);
$volumenAgua = (integer)($_POST["vol_agua"] ?? 0);
$densidad = (float)($_POST["densidad"] ?? 0);
$riqueza = (float)($_POST["riqueza"] ?? 0);
$notas = $_POST["notas"] ?? "";
$deposito = $_POST["deposito"] ?? "";
$fabricaciones = $_POST["fabricaciones"] ?? "";

function generarID()
{
    date_default_timezone_set("Europe/Madrid");
    $ID = date("dmYHi");    
    return $ID;
}

    $id = generarID();
    
    $InsertSQL = "INSERT INTO fabricaciones_en_curso (
                                NumeroFabricacion, 
                                Producto_id,
                                FechaInicio,
                                Mezclador,
                                PesoInicialMezclador,
                                Volumen_Agua,
                                Fab_Filtradas,
                                Deposito,
                                Notas,
                                Riqueza, 
                                Densidad
                            )
                            VALUES (
                                :id,
                                'Filtrado',
                                NOW(),
                                'M216',
                                :pesoM,
                                :agua,
                                :fab,
                                :dep,
                                :notas,
                                :riqueza,
                                :densidad
                                )";
          
    $stmt = $conexion->prepare($InsertSQL);    
    $stmt->bindParam(":id", $id);        
    $stmt->bindParam(":pesoM", $volumenInicial);
    $stmt->bindParam(":agua", $volumenAgua);
    $stmt->bindParam(":fab", $fabricaciones);  
    $stmt->bindParam(":dep", $deposito);
    $stmt->bindParam(":notas", $notas);
    $stmt->bindParam(":riqueza", $riqueza);
    $stmt->bindParam(":densidad", $densidad);    
    $stmt->execute();   

    $updateSQL ="UPDATE equipos
                 SET Estado = 'En uso'
                 WHERE Equipo_id IN (:mezclador)
                 OR Equipo_id IN (:dep)";

    $stmt = $conexion->prepare($updateSQL);
    $stmt->bindValue(":mezclador", "M216");
    $stmt->bindValue(":dep", $deposito);
    $stmt->execute();

    echo json_encode([
        "ok" => true,
        "id" => $id,
        "fabricaciones" => $fabricaciones,
        "volumeninicial" => $volumenInicial,
        "volumenagua" => $volumenAgua,        
        "densidad" => $densidad,
        "riqueza" => $riqueza,
        "deposito" => $deposito, 
        "notas" => $notas        
    ]); exit;

?>
