```mermaid
flowchart TD
    A([INICIO]) --> B{modo === "transferir"?}
    B -->|NO| Z([FIN])
    B -->|SÍ| C{Mezclador ≠ null<br>Y<br>Reactor vacío?}

    %% --- BLOQUE M → R ---
    C -->|SÍ| D[Modo transferencia M → R<br><br>
        • Cambiar botón a "Transferir"<br>
        • inicializarFormulario()<br>
        • Deshabilitar peso_final_reactor]

    D --> E[Click en botón "Transferir"]
    E --> F{Validaciones:
        • pesoMF
        • reactorSeleccionado
        • pesoR}

    F -->|Falla| E
    F -->|OK| G[Crear FormData<br>mezclaAReactor]
    G --> H[fetch → Transferir/mezclaAReactor]
    H --> I{json.ok?}
    I -->|SÍ| J[Mostrar modal "Producción transferida"]
    I -->|NO| K[alert(json.error)]

    %% --- BLOQUE R → M216 ---
    C -->|NO| L{PesoInicialReactor ≠ null<br>Y<br>Reactor ≠ null?}

    L -->|NO| Z
    L -->|SÍ| M[Modo transferencia R → M216<br><br>
        • Cambiar botón a "Finalizar"<br>
        • inicializarFormulario()<br>
        • Habilitar peso_final_reactor]

    M --> N[Click en botón "Finalizar"]
    N --> O{Validar peso_final_reactor}

    O -->|Falla| N
    O -->|OK| P[Crear FormData<br>reactorAM216]
    P --> Q[fetch → Transferir/reactorAM216]
    Q --> R[alert "Producción transferida a M216"]
    R --> S[Redirigir a home]

    Z --> T([FIN])