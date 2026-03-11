<?php

class LeerController {
    public function lectura() {
        include __DIR__ . '/../models/lectura.php';
    }

    public function leerferrico() {
        include __DIR__ . '/../models/leerFerrico.php';
    }
}