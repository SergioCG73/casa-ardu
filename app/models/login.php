<?php
/*https://www.mauriciodeveloper.com/post/login-con-php-y-mysql-crea-un-acceso-protegido-en-tu-sitio-web-243?utm_content=<cmp-true></cmp-true>*/

//require_once("Includes/miconexion.php");
require_once("miconexion.php");

$username = $_POST['usuario'];
$password = $_POST['clave'];

$consulta = "SELECT * FROM usuarios WHERE usuario= :usuario AND clave= :clave";
$stmt = $conexion->prepare($consulta);
$stmt->bindParam(":usuario", $username);
$stmt->bindParam(":clave", $password);
$stmt->execute();

if ($stmt->rowCount() == 1) {
    session_start();
    $_SESSION['username'] = $username;
    echo "OK"; // fetch lo recibirá
} else {
    echo "ERROR";
}

?>
