<?php
/*https://www.mauriciodeveloper.com/post/login-con-php-y-mysql-crea-un-acceso-protegido-en-tu-sitio-web-243?utm_content=<cmp-true></cmp-true>*/

require_once("miconexion.php");

$username = $_POST['usuario'];
$password = $_POST['clave'];

$consulta = "SELECT * FROM usuarios WHERE usuario = :usuario AND clave = :clave";
$stmt = $conexion->prepare($consulta);
$stmt->bindParam(":usuario", $username);
$stmt->bindParam(":clave", $password);
$stmt->execute();

if ($stmt->rowCount() == 1) {

    $usuario = $stmt->fetch(PDO::FETCH_ASSOC); // ← AQUÍ estaba el error

    session_start();
    $_SESSION['username'] = $usuario["usuario"];
    $_SESSION['rol'] = $usuario["rol"];    

    echo json_encode([
        "ok" => true,
        "username" => $usuario["usuario"],
        "rol" => $usuario["rol"]
    ]);
    exit;

} else {

    echo json_encode(["ok" => false]);
}

?>