<?php
require_once("miconexion.php");

$numProduccion = $_POST['num_produccion'];

// Consulta a la base de datos poo

$sql = "SELECT NumeroFabricacion FROM p18_terminadas ORDER BY NumeroFabricacion DESC LIMIT 1";
$stmt = $conexion->prepare($sql);

$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {        
    echo "Producción: $numProduccion";
} else {
    echo "❌ Receta no encontrada";
}

$stmt->close();
$conexion->close();
