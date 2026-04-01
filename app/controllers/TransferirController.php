<?php

class TransferirController {

    public function mezclaAReactor() {
        require_once __DIR__ . "/../models/transferirFabCurso.php";
    }

    public function reactorAM216() {        
        require_once __DIR__ . "/../models/transferirFabCurso.php";
    }

    public function transferirSulfato() {        
        require_once __DIR__ . "/../models/transferirSulfato.php";        
        
    }

    public function transferirFerrico() {
        //echo json_encode(["LINE" => __LINE__]); exit;
        require_once __DIR__ . "/../models/transferirFerrico.php";
    }
}
