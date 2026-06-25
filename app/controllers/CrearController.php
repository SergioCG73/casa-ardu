<?php

/*echo json_encode([
    "FILE" => __FILE__
]); exit;*/

class CrearController {
    public function login() {
        require_once __DIR__ . "/../models/login.php";
    }

    public function fabricacionP18() {
        require_once __DIR__ . "/../models/crearP18.php";
    }

    public function fabricacionSulfato() {
        require_once __DIR__ . "/../models/crearSulfato.php";
    }

    public function ferrico() {
        require_once __DIR__ . "/../models/crearFerrico.php";
    }

    public function filtrado() {      
        require_once __DIR__ . "/../models/crearFiltrado.php";
    }
}
