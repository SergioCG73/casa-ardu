<?php    
    require_once("database.php");

    try {
        $conexion = new PDO(DB_DSN, DB_USER, DB_PASS);
        //echo "Conectado";    
        //echo "<br>";    
    }
    
    catch (PDOException $e) {
        echo "¡Error en la conexión: " . $e->getMessage();
        die();
        $conexion = null;
    }

?>
