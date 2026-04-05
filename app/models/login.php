<?php
/*https://www.mauriciodeveloper.com/post/login-con-php-y-mysql-crea-un-acceso-protegido-en-tu-sitio-web-243?utm_content=<cmp-true></cmp-true>*/

//require_once("Includes/miconexion.php");
require_once("miconexion.php");

$username = $_POST['usuario'];
$password = $_POST['clave'];

$consulta = "SELECT * FROM usuarios WHERE usuario='$username' AND clave='$password'";
$resultado = mysqli_query($miconexion, $consulta);

if(mysqli_num_rows($resultado) == 1){
    session_start();
    $_SESSION['username']=$username;
    header('location: portada.html');
}
else
{
    echo "Nombre de usuario o password incorrecto";
}

mysqli_close($conexion);

?>
