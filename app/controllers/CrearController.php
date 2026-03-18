<?php

/*echo json_encode([
    "FILE" => __FILE__
]); exit;*/

class CrearController {

    public function fabricacionP18() {
        require_once __DIR__ . "/../models/crearP18.php";
    }

    public function fabricacionSulfato() {
        require_once __DIR__ . "/../models/crearSulfato.php";
    }

    public function fabricacionFerrico() {
        require_once __DIR__ . "/../models/crearFerrico.php";
    }
}
