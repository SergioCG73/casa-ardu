<?php

//echo json_encode(["FILE" => __FILE__]); exit;

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

    public function leerproductos() {          
        include __DIR__ . '/../models/leerProductos.php';
    }

    public function leeranaliticas() {
        //echo json_encode(["LINE" => __LINE__]); exit;
        include __DIR__ . '/../models/leerAnaliticas.php';
    }

    public function leerJSON() {
    header("Content-Type: application/json");
    
    $ruta = __DIR__ . "/../../public/config/config.json";

    if (!file_exists($ruta)) {
        echo json_encode(["error" => "Archivo no encontrado"]);
        return;
    }

    $contenido = file_get_contents($ruta);
    echo $contenido;
}

}
