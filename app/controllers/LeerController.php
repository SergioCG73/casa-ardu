<?php

class LeerController {
    public function lectura() {
        include __DIR__ . '/../models/lectura.php';
    }

    public function leerP18() {
        include __DIR__ . '/../models/leerP18.php';
    }

     public function leersulfato() {
        //echo json_encode(["LINE" => __LINE__]); exit;
        include __DIR__ . '/../models/leerSulfato.php';
    }

    public function leerferrico() {
        //echo json_encode(["LINE" => __LINE__]); exit;
        include __DIR__ . '/../models/leerFerrico.php';
    }

    public function leerfiltrado() {        
        include __DIR__ . '/../models/leerFiltrado.php';
    }

    public function leerfiltradas() {          
        include __DIR__ . '/../models/leerFiltradas.php';
    }
}
