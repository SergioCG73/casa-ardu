<?php

$c = $_GET['c'] ?? 'Home';  //Recoge el nombre del fichero y de la clase controller.
$a = $_GET['a'] ?? 'index'; //Recoge el método

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