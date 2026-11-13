<?php

class HB10Controller {
    public function leer() {
        //echo json_encode(["LINE" => __LINE__]); exit;
        include __DIR__ . '/../models/leerHB10.php';
    }

    public function crear() {
        //echo json_encode(["LINE" => __LINE__]); exit;
        require_once __DIR__ . "/../models/crearHB10.php";
    }

    public function editar() {
        require_once __DIR__ . "/../models/editarFabCurso.php";
    }

    public function transferir() {
        require_once __DIR__ . "/../models/transferirHB10.php";
    }

    public function guardarAnalitica() {
        require_once __DIR__ . "/../models/guardarAnaliticaHB10.php";
    }

    public function view() {
        require_once __DIR__ . "/../views/viewHB10.php";
    }
}
