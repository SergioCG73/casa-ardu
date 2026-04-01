<?php



class LeerController {
    public function lectura() {
        include __DIR__ . '/../models/lectura.php';
    }

    public function leerferrico() {
        //echo json_encode(["LINE" => __LINE__]); exit;
        include __DIR__ . '/../models/leerFerrico.php';
    }

    public function leerfiltrado() {        
        include __DIR__ . '/../models/leerFiltrado.php';
    }
}
