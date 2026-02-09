<?php

$c = $_GET['c'] ?? 'Home';
$a = $_GET['a'] ?? 'index';

$controllerFile = __DIR__ . '/../app/controllers/' . $c . 'Controller.php';

if (!file_exists($controllerFile)) {
    die("No existe el controlador: $controllerFile");
}

require_once $controllerFile;

$controllerClass = $c . 'Controller';

if (!class_exists($controllerClass)) {
    die("La clase $controllerClass no existe");
}

$controller = new $controllerClass();

if (!method_exists($controller, $a)) {
    die("El método $a no existe en $controllerClass");
}

$controller->$a();


