<?php

class P18Controller {
    public function crear() {
        require_once __DIR__ . "/../models/crearP18.php";
    }

    public function leer() {
        include __DIR__ . '/../models/leerP18.php';
    }

    public function editar() {
        require_once __DIR__ . "/../models/editarFabCurso.php";
    }

    public function view() {
        require_once __DIR__ . "/../views/viewP18.php";
    }

    public function mezclaAReactor() {
        require_once __DIR__ . "/../models/transferirP18.php";
    }

    public function reactorAM216() {        
        require_once __DIR__ . "/../models/transferirP18.php";
    }

    public function crearFiltrado() {        
        //echo json_encode(["LINE" => __LINE__]); exit;
        require_once __DIR__ . "/../models/crearFiltrado.php";
    }

    public function filtrado() {
        require_once __DIR__ . "/../models/finFiltracion.php";
    }

    
}