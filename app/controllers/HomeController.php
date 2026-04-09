<?php 

class HomeController {    
    public function home() {
        $rol = $_SESSION["rol"] ?? "";
        require_once '../app/views/home.php';
    }
}

?>