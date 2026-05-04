<?php

//echo json_encode(["FILE" => __FILE__]); exit;

ob_clean();
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);

require_once("miconexion.php");

$input = json_decode(file_get_contents("php://input"), true);
$productos = $input["productosSeleccionados"] ?? [];

if (empty($productos)) {
    $productos = ["ferrico", "sulfato", "P18"];
}

// Criterio de fechas

$desde = !empty($input["desde"]) ? $input["desde"] : date("Y-m-d");
$hasta = !empty($input["hasta"]) ? $input["hasta"] : date("Y-m-d");

$whereFecha = "";

if (!empty($desde) && !empty($hasta)) {
    $whereFecha = "WHERE Fecha BETWEEN :desde AND :hasta";
} elseif (!empty($desde)) {
    $whereFecha = "WHERE Fecha >= :desde";
} elseif (!empty($hasta)) {
    $whereFecha = "WHERE Fecha <= :hasta";
}

if (!empty($desde)) {
    $desde = date("Y-m-d", strtotime(str_replace("/", "-", $desde)));
}

if (!empty($hasta)) {
    $hasta = date("Y-m-d", strtotime(str_replace("/", "-", $hasta)));
}


// Criterio Valor analítica
$valorMin = $input["valorMin"] ?? null;
$valorMax = $input["valorMax"] ?? null;

if ($valorMin == 0 && $valorMax == 0) {
    $valorMin = null;
    $valorMax = null;
}

$limiteTotal = intval($input["limite"] ?? 5);
$buscador = intval($input["buscador"] ?? null);
$resultadoFinal = [];
$totalProductos = count($productos);
$limiteBase = intdiv($limiteTotal, $totalProductos);
$resto = $limiteTotal % $totalProductos;

/*echo json_encode(["productos" => $productos,
                  "limiteTotal" => $limiteTotal,
                  "buscador" => $buscador,
                  "resultadoFinal" => $resultadoFinal,
                  "totalProductos" => $totalProductos,
                  "limiteBase" => $limiteBase,
                  "resto" => $resto,
                  "desde" => $desde,
                  "hasta" => $hasta,
                  "valorMin" => $valorMin,
                  "valorMax" => $valorMax
                    
]); exit;*/

foreach ($productos as $producto) {
    // Calcular límite para este producto
    $limiteProducto = $limiteBase;
    if ($resto > 0) {
        $limiteProducto++;
        $resto--;
    }

    /*echo json_encode(["debug" => $input,
                      "desde" => $desde,
                      "hasta" => $hasta    
    ]); exit;   */

    // -------------------------
    // CASO ESPECIAL: P18
    // -------------------------
    if (strtolower($producto) === "p18") {
        if ($buscador === 1) {
            // P18 con analítica → tabla p18_terminadas            
            $sql = "SELECT * FROM filtraciones_p18 $whereFecha AND Valoracion BETWEEN :valorMin AND :valorMax ORDER BY Fecha DESC LIMIT $limiteProducto";
            $stmt = $conexion->prepare($sql);

            if (!empty($desde)) {
                $stmt->bindParam(":desde", $desde);
            }
            if (!empty($hasta)) {
                $stmt->bindParam(":hasta", $hasta);
            }

            $stmt->bindParam(":valorMin", $valorMin, PDO::PARAM_INT);
            $stmt->bindParam(":valorMax", $valorMax, PDO::PARAM_INT);
            $stmt->execute();
            $filas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $resultadoFinal[$producto] = $filas;
            continue;
        }

        // P18 sin analítica → mezclador_216 (tu lógica actual)
        $sql = "SELECT NumeroFabricacion FROM mezclador_216 LIMIT $limiteProducto";
        $stmt = $conexion->prepare($sql);
        $stmt->execute();
        $filas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        //echo json_encode(["filas" => $filas]); exit;
        $normales = [];
        $restos = false;

        foreach ($filas as $fila) {
            $num = $fila["NumeroFabricacion"];

            if ($num === "0000") {
                $restos = true;
            } else {
                $normales[] = $num;
            }
        }

        $resultado = implode(" + ", $normales);

        if ($restos) {
            $resultado = ($resultado !== "") ? "$resultado + Restos" : "Restos";
        }

        $resultadoFinal[$producto] = ($resultado === "") ? [] : [$resultado];
        continue;
    }

    //echo json_encode(["resultadoFinal" => $resultadoFinal]); exit;

    // -------------------------
    // RESTO DE PRODUCTOS
    // -------------------------
    $tabla = strtolower($producto) . "_terminadas";

    // Construir WHERE según filtro
    $where = [];

    if ($buscador === 0) {
        // SIN ANALÍTICA
        $sql = "SELECT * FROM $tabla WHERE Analitica IS NULL LIMIT $limiteProducto";
    } elseif ($buscador === 1) {

        // CON ANALÍTICA

        // Fechas
        if (!empty($desde)) {
            $where[] = "Fecha >= :desde";
        }

        if (!empty($hasta)) {
            $where[] = "Fecha <= :hasta";
        }

        // Rango de valor
        if ($valorMin !== null && $valorMax !== null) {
            $where[] = "Valoracion BETWEEN :valorMin AND :valorMax";
        }

        // Analítica obligatoria
        $where[] = "Analitica IS NOT NULL";

        // Construir WHERE final
        $whereSQL = "WHERE " . implode(" AND ", $where);

        $sql = "SELECT * FROM $tabla $whereSQL ORDER BY Fecha DESC LIMIT $limiteProducto";
    }

    try {
        $stmt = $conexion->prepare($sql);

        // Bind dinámico
        if (!empty($desde)) {
            $stmt->bindParam(":desde", $desde);
        }

        if (!empty($hasta)) {
            $stmt->bindParam(":hasta", $hasta);
        }

        if ($valorMin !== null && $valorMax !== null) {
            $stmt->bindParam(":valorMin", $valorMin, PDO::PARAM_INT);
            $stmt->bindParam(":valorMax", $valorMax, PDO::PARAM_INT);
        }

        $stmt->execute();
        $resultadoFinal[$producto] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $resultadoFinal[$producto] = [
            "error" => $e->getMessage(),
            "tabla" => $tabla
        ];
    }
}

echo json_encode(["analiticas" => $resultadoFinal]);
exit;
