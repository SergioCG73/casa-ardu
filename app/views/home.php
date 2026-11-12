<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Fuente moderna e industrial -->
    <link rel="preconnect" href="https://googleapis.com">
    <link href="https://googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="css/styleHome.css" rel="stylesheet" type="text/css">
    <title>Control de Producción | Planta Química</title>
</head>

<body>
    <!-- Barra superior de navegación / estado -->
    <header class="topbar">
        <div class="topbar-brand">
            <span class="status-dot"></span>
            <h1>Control de Producción</h1>
        </div>
        <div class="topbar-info">
            <span class="badge-rol">Rol: <?= isset($rol) && $rol !== '' ? htmlspecialchars($rol) : 'Operador' ?></span>
        </div>
    </header>

    <main class="dashboard-container">
        <!-- Panel de selección de líneas / productos -->
        <section class="card panel-controles">
            <div class="card-header">
                <h2>Nueva Producción / Selección de Línea</h2>
                <span class="subtitle">Selecciona un producto para iniciar o gestionar</span>
            </div>
            <div name="botonera" class="botonera-grid">
                <button id="btnP18" class="boton"><span class="btn-icon">⚗️</span> P18</button>
                <button id="btnFiltrado" class="boton"><span class="btn-icon">💧</span> Filtrado P18</button>
                <button id="btnSulfato" class="boton"><span class="btn-icon">🧪</span> Sulfato</button>
                <button id="btnFerrico" class="boton"><span class="btn-icon">🔥</span> Férrico</button>
                <button id="btnHb10" class="boton"><span class="btn-icon">🧫</span> HB 10</button>
            </div>
        </section>

        <!-- Cuadrícula principal: Sinóptico + Tabla de producciones -->
        <div class="workspace-grid">
            
            <!-- Tarjeta del diagrama SVG (M216) -->
            <section class="card panel-sinoptico">
                <div class="card-header">
                    <h2>Mezclador M216</h2>
                    <span class="badge-live">EN VIVO</span>
                </div>
                <div id="displayM216" class="m216">
                    <object
                        id="svgM216"
                        type="image/svg+xml"
                        data="images/m216.svg"
                        width="100%"
                        height="100%">
                    </object>
                </div>
            </section>

            <!-- Tarjeta de Producciones en Curso -->
            <section id="producciones_en_curso" name="producciones_en_curso" class="card producciones_en_curso" style="display:none">
                <div class="card-header">
                    <h2>Producciones en Curso</h2>
                    <span class="subtitle">Monitorización de lotes activos</span>
                </div>
                <div class="table-responsive">
                    <table id="tabla" name="tabla" class="tabla"></table>
                </div>
            </section>

        </div>
    </main>

    <script>
        const ROL_USUARIO = "<?= isset($rol) ? $rol : '' ?>";
    </script>
    <script src="js/home.js"></script>
    <script src="js/utils.js"></script>
</body>

</html>
