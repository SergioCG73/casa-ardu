<?php

// Preparar script para JSON limpio
ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);

require_once("miconexion.php");

// ===============================
// Última producción terminada
// ===============================
$sql = "SELECT NumeroFabricacion 
        FROM p18_terminadas 
        ORDER BY NumeroFabricacion DESC 
        LIMIT 1";

$stmt = $conexion->prepare($sql);
$stmt->execute();
$ultimoNumeroTerminada = $stmt->fetchColumn();
$ultimoNumeroTerminada = $ultimoNumeroTerminada ?? 0;

// ===============================
// Última producción en curso
// ===============================
$sql = "SELECT NumeroFabricacion, FechaTransferenciaMezclador
        FROM fabricaciones_en_curso
        WHERE Producto_id = 'P18'
        ORDER BY NumeroFabricacion DESC
        LIMIT 1";

$stmt = $conexion->prepare($sql);
$stmt->execute();
$fila = $stmt->fetch(PDO::FETCH_ASSOC);
    
// NUEVO SQL // ========================= 24/01/26 17:00

//===================================
// Todas las producciones en curso
//===================================

/*$sql = "SELECT FechaInicio, Mezclador, Reactor,
               Receta, NumeroFabricacion, Producto_id
        FROM fabricaciones_en_curso
        WHERE Producto_id = 'P18'
        ORDER BY NumeroFabricacion DESC";*/

        $sql = "SELECT FechaInicio, Mezclador, PesoInicialMezclador, Reactor,
                        Receta, NumeroFabricacion, Producto_id
                FROM fabricaciones_en_curso
                WHERE Producto_id = 'P18'
                ORDER BY NumeroFabricacion DESC";


$stmt = $conexion->prepare($sql);
$stmt-> execute();
$producciones_en_curso = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Manejo de los datos devueltos en $fila
if ($fila) {
    $ultimoNumeroCurso = $fila['NumeroFabricacion'];
    $fechaTransferencia = $fila['FechaTransferenciaMezclador'];
} else {
    $ultimoNumeroCurso = 0;
    $fechaTransferencia = null;
}

// ===============================
// Cálculo seguro del último número
// ===============================
$ultimoNumero = max((int)$ultimoNumeroTerminada, (int)$ultimoNumeroCurso);

// ===========================================
// Coger la fecha de transferencia más antigua
// ===========================================

$sqlSelect = "SELECT FechaTransferenciaMezclador
                FROM fabricaciones_en_curso
                WHERE Producto_id = 'P18'
                ORDER BY FechaTransferenciaMezclador DESC
                LIMIT 1";

$stmt = $conexion -> prepare($sqlSelect);
$stmt->execute();
$fila = $stmt->fetch(PDO::FETCH_ASSOC);

if ($fila && !empty($fila['FechaTransferenciaMezclador'])) {
    $fechaTransferencia = date('Y-m-d H:i:s', strtotime($fila['FechaTransferenciaMezclador']));
} else {
    $fechaTransferencia = date('Y-m-d H:i:s'); // fecha actual
}

// ===============================
// Mezcladores
// ===============================
$sql = "SELECT Equipo_id, NombreEquipo, Estado
        FROM equipos 
        WHERE Tipo ='Mezclador' AND ProductoFabricado = 'P18'";

$stmt = $conexion->prepare($sql);
$stmt->execute();
$mezcladores = $stmt->fetchAll(PDO::FETCH_ASSOC);

// ===============================
// Reactores
// ===============================
/*$sql = "SELECT Equipo_id, NombreEquipo, ProductoFabricado, Estado
        FROM equipos
        WHERE Tipo = 'Reactor' AND Estado = 'Vacio'";*/

$sql = "SELECT Equipo_id, NombreEquipo, ProductoFabricado, Estado
        FROM equipos
        WHERE Tipo = 'Reactor' AND ProductoFabricado = 'P18'";

$stmt = $conexion->prepare($sql);
$stmt->execute();
$reactores = $stmt->fetchAll(PDO::FETCH_ASSOC);

// ===============================
// Recetas
// ===============================
$sql = "SELECT Receta_id, NombreReceta
        FROM recetas
        WHERE ProductoFabricado = 'P18' AND Estado = 'En uso'";

$stmt = $conexion->prepare($sql);
$stmt->execute();
$recetas = $stmt->fetchAll(PDO::FETCH_ASSOC);

// ===============================
// Respuesta JSON única
// ===============================
echo json_encode([
    "ok" => true,
    "ultimoNumero" => $ultimoNumero,
    "mezcladores" => $mezcladores,
    "reactores" => $reactores,
    "recetas" => $recetas,
    "fechaTransferencia" => $fechaTransferencia,
    "producciones_en_curso" => $producciones_en_curso
], JSON_UNESCAPED_UNICODE);

exit;
