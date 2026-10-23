<?php

//echo json_encode(["FILE" => __FILE__]); exit;

class EditarController {
    public function fabCurso() {
        require_once __DIR__ . "/../models/editarFabCurso.php";
    }

    public function filtrado() {
        //echo json_encode(["FILE" => __FILE__]); exit;
        require_once __DIR__ . "/../models/editarFiltrado.php";
    }
}
