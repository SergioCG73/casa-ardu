<?php

class FormularioController {
    //public function mostrar() {
    public function p18() {
        //require_once "../app/views/formulario.php"; //funciona sin DIR
        //require_once __DIR__ . "/../views/formulario.php";
        require_once __DIR__ . "/../views/formP18.php";
    }

    public function sulfato() {
        //require_once "../app/views/formSulfato.php"; funciona sin DIR
        require_once __DIR__ . "/../views/formSulfato.php";
    }

    public function ferrico() {
        //require_once "../app/views/formSulfato.php"; funciona sin DIR
        require_once __DIR__ . "/../views/formFerrico.php";
    }
}
