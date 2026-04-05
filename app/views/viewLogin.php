<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Login</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="author" content="Sergio Cano González">
    <meta name="description" content="Formulario de acceso">
    <meta name="keywords" content="login,formulario de acceso html">        
    <link href="https://fonts.googleapis.com/css?family=Nunito&display=swap" rel="stylesheet">                 
    <link rel="stylesheet" href="css/styleLogin.css" type="text/css">    
</head>
<body>
    <div id="contenedor">            
            <div id="contenedorcentrado">
                <div id="login">                    
                        <label for="usuario">Usuario</label>
                        <input id="usuario" type="text" name="usuario" placeholder="Usuario" required autofocus>                        
                        <label for="password">Contraseña</label>
                        <input id="password" type="password" placeholder="Contraseña" name="clave" required>                        
                        <button id = "btnIngresar" type="submit" title="Ingresar" name="Ingresar">Login</button>                    
                </div>
                <div id="derecho">
                    <div class="titulo">
                        Bienvenido
                    </div>
                    <hr>
                    <hr>                   
                </div>
            </div>
        </div>    
</body>
    <script src="js/login.js"></script>
</html>
