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

/*echo json_encode(["fabricaciones" => $fabricaciones,
                "densidad" => $densidad,
                "riqueza" => $riqueza
]); exit;*/

//Para quitar el texto que hay antes del número de las fabricaciones
//if (preg_match('/\d.*/', $fabricaciones, $matches)) {$fabricaciones = $matches[0];}

//--------------------------------------------------------------------

function generarID()
{
    date_default_timezone_set("Europe/Madrid");
    $ahora = date("d") . date("m") . date("Y") . date("H") . date("i");
    $ID = $ahora;
    return $ID;
}

    //Se utiliza el campo NumeroFabricacion para recoger el ID de la filtración
    //Se utiliza el campo Mezclador para recoger las fabricaciones que se filtran.
    //Se utiliza el campo PesoInicialMezclador para recoger el Volumen inicial del M216
    //Se utiliza el campo PesoFinalMezclador para recoger el Volumen de agua
    //Se utiliza el campo Reactor para recoger el depósito

    $id = generarID();
    $InsertSQL  = "INSERT INTO fabricaciones_en_curso 
                  (NumeroFabricacion, Mezclador, Reactor, PesoInicialMezclador, PesoFinalMezclador, Producto_id, Riqueza, Densidad, Notas) 
                  VALUES (:id, :fab, :de, :vi, :va, :p, :r, :d, :n)";

    $stmt = $conexion->prepare($InsertSQL);
    $stmt->bindParam(":id", $id);
    $stmt->bindParam(":fab", $fabricaciones);
    $stmt->bindParam(":de", $deposito);
    $stmt->bindValue(":vi", $volumenInicial);
    $stmt->bindValue(":va", $volumenAgua);
    $stmt->bindValue(":d", $densidad);
    $stmt->bindValue(":r", $riqueza);    
    $stmt->bindParam(":n", $notas);
    $stmt->bindValue(":p", "Filtrado");
    $stmt->execute();

    $updateSQL ="UPDATE equipos
                 SET Estado = 'En uso'
                 WHERE Equipo_id IN (:m)
                 OR Equipo_id IN (:de)";

    $stmt = $conexion->prepare($updateSQL);
    $stmt->bindValue(":m", "M216");
    $stmt->bindValue(":de", $deposito);
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