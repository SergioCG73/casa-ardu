<?php

$c = !empty($_GET['c']) ? $_GET['c'] : 'Formulario';
$a = !empty($_GET['a']) ? $_GET['a'] : 'login';

$controllerFile = __DIR__ . '/../app/controllers/' . $c . 'Controller.php';

if (!file_exists($controllerFile)) {
    die("No existe el controlador: $controllerFile");
}

require_once $controllerFile;

$controllerClass = $c . 'Controller';

if (!class_exists($controllerClass)) {
    die("La clase $controllerClass no existe");
}

$controller = new $controllerClass(); //Crear el objeto $controller con la clase que toca

if (!method_exists($controller, $a)) {
    die("El método $a no existe en $controllerClass");
}

$controller->$a(); //Al entrar en la app llama a index()
