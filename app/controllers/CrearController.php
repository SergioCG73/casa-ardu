<?php

class CrearController {

    public function fabricacion() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // Si es POST, procesamos la inserción en la BD
            require_once __DIR__ . "/../models/crearP18.php";
            exit; // El modelo ya suelta el JSON y corta la ejecución
        }

        // Si es GET (al hacer clic en el botón o poner la URL), CARGAMOS LA VISTA
        // Asegúrate de que esta ruta apunte a tu archivo HTML/PHP del formulario
        require_once __DIR__ . "/../views/formP18.php";        
}

} // Fin de la clase


