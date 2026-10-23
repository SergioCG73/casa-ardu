<?php

//echo json_encode(["FILE" => __FILE__]); exit;

class LaboratorioController {

public function obtenerAnaliticas() {
        //echo json_encode(["LINE" => __LINE__]); exit;
        include __DIR__ . '/../models/leerAnaliticas.php';
    }

}