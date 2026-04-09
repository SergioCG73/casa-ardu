<?php

class FormularioController {  
    
    public function home() {
        session_start();
        $rol = $_SESSION["rol"];
        require_once __DIR__ . "/../views/home.php";        
    }

    public function laboratorio() {
        session_start();
        $rol = $_SESSION["rol"];
        require_once __DIR__ . "/../views/viewLaboratorio.php";        
    }
    
    public function login() {
        //echo "LINE", __LINE__ ; exit;
        require_once __DIR__ . "/../views/viewLogin.php";      
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
