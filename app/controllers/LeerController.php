<?php



class LeerController {
    public function lectura() {
        include __DIR__ . '/../models/lectura.php';
    }

    public function leerferrico() {
        include __DIR__ . '/../models/leerFerrico.php';
    }

    public function leerfiltrado() {
        //echo json_encode(["LINE" => __LINE__]); exit;
        include __DIR__ . '/../models/leerFiltrado.php';
    }
}