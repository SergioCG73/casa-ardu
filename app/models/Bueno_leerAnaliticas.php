<?php

ob_clean();
header('Content-Type: application/json; charset=utf-8');

require_once("miconexion.php");

// Entrada combinada: JSON o POST
$input = json_decode(file_get_contents("php://input"), true);
$productos = $input["productosSeleccionados"] ?? [];
$limite = intval($input["limite"] ?? $_POST["limite"] ?? 1);
$filtroAnalitica = intval($input["filtroAnalitica"] ?? $_POST["filtroAnalitica"] ?? 1);

if (empty($productos)) {
    $productos = ["ferrico", "sulfato", "P18"];
};

//echo json_encode(["producto" => $productos]); exit;

$resultadoFinal = [];

$totalProductos = count($productos);
$limiteTotal = $limite;

$limiteBase = intdiv($limiteTotal, $totalProductos);
$resto = $limiteTotal % $totalProductos;

foreach ($productos as $producto) {
// Calcular límite para este producto
    $limiteProducto = $limiteBase;
    if ($resto > 0) {
        $limiteProducto++;
        $resto--;
    }

    // -------------------------
    // CASO ESPECIAL: P18
    // -------------------------
    if (strtolower($producto) === "p18") {
        $sql = "SELECT NumeroFabricacion FROM mezclador_216";
        $stmt = $conexion->prepare($sql);
        $stmt->execute();
        $filas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $normales = [];
        $restos = false;

        foreach ($filas as $fila) {
            $num = $fila["NumeroFabricacion"];

            if ($num === "0000") {
                $restos = true; // marcar que existe "Restos"
            } else {
                $normales[] = $num; // añadir número normal
            }
        }

        // Construir string final
        $resultado = implode(" + ", $normales);

        if ($restos) {
            if ($resultado !== "") {
                $resultado .= " + Restos";
            } else {
                $resultado = "Restos";
            }
        }

        if ($resultado === "") {
            $resultadoFinal[$producto] = [];
        } else {
            $resultadoFinal[$producto] = [$resultado];
        }

        continue;
    }

    // -------------------------
    // RESTO DE PRODUCTOS
    // -------------------------
    $tabla = strtolower($producto) . "_terminadas";
    $sql = "SELECT * FROM $tabla WHERE Analitica IS NULL LIMIT $limite";

    try {
        $stmt = $conexion->prepare($sql);
        $stmt->execute();

        $filas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $resultadoFinal[$producto] = $filas;
    } catch (PDOException $e) {
        $resultadoFinal[$producto] = [
            "error" => $e->getMessage(),
            "tabla" => $tabla
        ];
    }
}

echo json_encode(["analiticas" => $resultadoFinal]);
exit;
