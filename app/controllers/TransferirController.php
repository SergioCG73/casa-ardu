<?php

//echo json_encode(["FILE" => __FILE__]); exit;

class TransferirController
{

    public function mezclaAReactor() {
        require_once __DIR__ . "/../models/transferirP18.php";
    }

    public function reactorAM216() {        
        require_once __DIR__ . "/../models/transferirP18.php";
    }

    public function transferirSulfato() {
        require_once __DIR__ . "/../models/transferirSulfato.php";
    }

    public function transferirFerrico() {
        require_once __DIR__ . "/../models/transferirFerrico.php";
    }

    public function filtrado() {
        require_once __DIR__ . "/../models/finFiltracion.php";
    }

    public function guardarAnaliticaFerrico() {        
        require_once __DIR__ . "/../models/guardarAnaliticaFerrico.php";
    }

    public function guardarAnaliticaSulfato() {
        require_once __DIR__ . "/../models/guardarAnaliticaSulfato.php";
    }

    public function guardarAnaliticaP18() {        
        //echo json_encode(["LINE" => __LINE__]); exit;
        require_once __DIR__ . "/../models/crearFiltrado.php";
    }
}
