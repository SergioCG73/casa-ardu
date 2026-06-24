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

if ($valorMin === 0 || $valorMin === "0" || $valorMin === null) {
    $valorMin = 0;
}

if ($valorMax === 0 || $valorMax === "0" || $valorMax === null) {
    $valorMax = 3; // o el máximo que uses
}

if ($valorMin > $valorMax) {
    $valorMax = $valorMin;
}

$limiteTotal = intval($input["limite"] ?? 5);
$buscador = intval($input["buscador"] ?? null);
$resultadoFinal = [];
$totalProductos = count($productos);
$limiteBase = intdiv($limiteTotal, $totalProductos);
$pagina = intval($input["pagina"] ?? 1);
$porPagina = intval($input["porPagina"] ?? 10);
$offset = ($pagina - 1) * $porPagina;

/*echo json_encode(["productos" => $productos,
                  "limiteTotal" => $limiteTotal,
                  "buscador" => $buscador,
                  "resultadoFinal" => $resultadoFinal,
                  "totalProductos" => $totalProductos,
                  "limiteBase" => $limiteBase,                  
                  "desde" => $desde,
                  "hasta" => $hasta,
                  "valorMin" => $valorMin,
                  "valorMax" => $valorMax,
                  "pagina" => $pagina,
                  "porPagina" => $porPagina,
                  "offset" => $offset
                    
]); exit;*/


foreach ($productos as $producto) {
    // Calcular límite para este producto
    $limiteProducto = $limiteBase;

    /*echo json_encode(["debug" => $input,
                      "desde" => $desde,
                      "hasta" => $hasta    
    ]); exit;   */

    // -------------------------
    // CASO ESPECIAL: P18
    // -------------------------
    if (strtolower($producto) === "p18") {
        if ($buscador === 1) {

            // -------------------------
            // NUEVO: COUNT TOTAL
            // -------------------------
            $sqlCount = "SELECT COUNT(*) AS total FROM filtraciones_p18 $whereFecha AND Valoracion BETWEEN :valorMin AND :valorMax";
            $stmtCount = $conexion->prepare($sqlCount);

            if (!empty($desde)) {
                $stmtCount->bindParam(":desde", $desde);
            }
            if (!empty($hasta)) {
                $stmtCount->bindParam(":hasta", $hasta);
            }

            $stmtCount->bindParam(":valorMin", $valorMin, PDO::PARAM_INT);
            $stmtCount->bindParam(":valorMax", $valorMax, PDO::PARAM_INT);
            $stmtCount->execute();

            $totalFilas = intval($stmtCount->fetchColumn());
            $totalPaginas = ceil($totalFilas / $porPagina);

            // -------------------------
            // SELECT PAGINADO (tu SQL original)
            // -------------------------
            $sql = "SELECT * FROM filtraciones_p18 $whereFecha AND Valoracion BETWEEN :valorMin AND :valorMax ORDER BY Fecha DESC LIMIT $porPagina OFFSET $offset";
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

            // -------------------------
            // NUEVO: devolver paginación
            // -------------------------
            $resultadoFinal[$producto] = [
                "datos" => $filas,
                "totalFilas" => $totalFilas,
                "totalPaginas" => $totalPaginas,
                "paginaActual" => $pagina
            ];

            continue;
        }

        // P18 sin analítica → mezclador_216 (tu lógica actual)
        $sql = "SELECT NumeroFabricacion FROM mezclador_216";
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

        // -------------------------
        // NUEVO: COUNT TOTAL
        // -------------------------
        $sqlCount = "SELECT COUNT(*) FROM $tabla WHERE Analitica IS NULL";
        $stmtCount = $conexion->prepare($sqlCount);
        $stmtCount->execute();
        $totalFilas = intval($stmtCount->fetchColumn());
        $totalPaginas = ceil($totalFilas / $porPagina);

        // SIN ANALÍTICA
        $sql = "SELECT * FROM $tabla WHERE Analitica IS NULL LIMIT $porPagina OFFSET $offset";
    } elseif ($buscador === 1 && strtolower($producto) === "sulfato") {

        if (!empty($desde)) {
            $where[] = "Hora_Finalizacion >= :desde";
        }

        if (!empty($hasta)) {
            $where[] = "Hora_Finalizacion <= :hasta";
        }

        if ($valorMin !== null && $valorMax !== null) {
            $where[] = "Analitica BETWEEN :valorMin AND :valorMax";
        }

        $where[] = "Analitica IS NOT NULL";

        $whereSQL = "WHERE " . implode(" AND ", $where);

        // -------------------------
        // NUEVO: COUNT TOTAL
        // -------------------------
        $sqlCount = "SELECT COUNT(*) FROM $tabla $whereSQL";
        $stmtCount = $conexion->prepare($sqlCount);

        if (!empty($desde)) $stmtCount->bindParam(':desde', $desde);
        if (!empty($hasta)) $stmtCount->bindParam(':hasta', $hasta);
        if ($valorMin !== null) $stmtCount->bindParam(':valorMin', $valorMin);
        if ($valorMax !== null) $stmtCount->bindParam(':valorMax', $valorMax);

        $stmtCount->execute();
        $totalFilas = intval($stmtCount->fetchColumn());
        $totalPaginas = ceil($totalFilas / $porPagina);

        // SELECT PAGINADO (tu SQL original)
        $sql = "SELECT * FROM $tabla $whereSQL ORDER BY Hora_Finalizacion DESC LIMIT $porPagina OFFSET $offset";
    } elseif ($buscador === 1 && strtolower($producto) === "ferrico") {

        if (!empty($desde)) {
            $where[] = "Fecha >= :desde";
        }

        if (!empty($hasta)) {
            $where[] = "Fecha <= :hasta";
        }

        if ($valorMin !== null && $valorMax !== null) {
            $where[] = "Analitica BETWEEN :valorMin AND :valorMax";
        }

        $where[] = "Analitica IS NOT NULL";

        $whereSQL = "WHERE " . implode(" AND ", $where);

        // -------------------------
        // NUEVO: COUNT TOTAL
        // -------------------------
        $sqlCount = "SELECT COUNT(*) FROM $tabla $whereSQL";
        $stmtCount = $conexion->prepare($sqlCount);

        if (!empty($desde)) $stmtCount->bindParam(':desde', $desde);
        if (!empty($hasta)) $stmtCount->bindParam(':hasta', $hasta);
        if ($valorMin !== null) $stmtCount->bindParam(':valorMin', $valorMin);
        if ($valorMax !== null) $stmtCount->bindParam(':valorMax', $valorMax);

        $stmtCount->execute();
        $totalFilas = intval($stmtCount->fetchColumn());
        $totalPaginas = ceil($totalFilas / $porPagina);

        // SELECT PAGINADO (tu SQL original)
        $sql = "SELECT * FROM $tabla $whereSQL ORDER BY Fecha DESC LIMIT $porPagina OFFSET $offset";
    }

    try {
        $stmt = $conexion->prepare($sql);

        if (strpos($sql, ':desde') !== false) $stmt->bindParam(':desde', $desde);
        if (strpos($sql, ':hasta') !== false) $stmt->bindParam(':hasta', $hasta);
        if (strpos($sql, ':valorMin') !== false) $stmt->bindParam(':valorMin', $valorMin);
        if (strpos($sql, ':valorMax') !== false) $stmt->bindParam(':valorMax', $valorMax);

        $stmt->execute();
        $filas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // -------------------------
        // NUEVO: devolver paginación
        // -------------------------
        $resultadoFinal[strtolower($producto)] = [
            "datos" => $filas,
            "totalFilas" => $totalFilas,
            "totalPaginas" => $totalPaginas,
            "paginaActual" => $pagina
        ];
    } catch (PDOException $e) {
        $resultadoFinal[$producto] = [
            "error" => $e->getMessage(),
            "tabla" => $tabla
        ];
    }
}

echo json_encode(["analiticas" => $resultadoFinal]);
exit;
