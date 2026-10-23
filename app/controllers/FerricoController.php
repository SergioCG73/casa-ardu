<?php

class FerricoController {
    public function crear() {
        require_once __DIR__ . "/../models/crearFerrico.php";
    }

    public function editar() {
        require_once __DIR__ . "/../models/editarFabCurso.php";
    }

    public function leer() {
        //echo json_encode(["LINE" => __LINE__]); exit;
        include __DIR__ . '/../models/leerFerrico.php';
    }

    public function transferir() {
        require_once __DIR__ . "/../models/transferirFerrico.php";
    }

    public function guardarAnalitica() {
        require_once __DIR__ . "/../models/guardarAnaliticaFerrico.php";
    }

    public function view() {
        require_once __DIR__ . "/../views/viewFerrico.php";
    }
}
