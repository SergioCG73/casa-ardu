<?php

class FormularioController {  
    public function home() {
        require_once "/../views/home.php";
    }
    
    public function login() {
        require_once "/../views/viewLogin.php";      
    }    
      
    public function p18() {
        require_once __DIR__ . "/../views/viewP18.php";
    }

    public function sulfato() {
        require_once __DIR__ . "/../views/viewSulfato.php";
    }

    public function ferrico() {
        require_once __DIR__ . "/../views/viewFerrico.php";
    }

    public function filtrado() {
        require_once __DIR__ . "/../views/viewFiltrado.php";
    }
}

?>
