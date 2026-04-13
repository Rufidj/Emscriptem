const Research = {
    buffers: [],
    
    log: function(msg) {
        const div = document.getElementById('log');
        div.innerHTML += `<div>[${new Date().toLocaleTimeString()}] ${msg}</div>`;
        div.scrollTop = div.scrollHeight;
    },

    // 1. Spraying: Llenamos la memoria con buffers para hacerla predecible
    sprayBuffers: function() {
        this.log("Iniciando Heap Spray...");
        try {
            for (let i = 0; i < 500; i++) {
                // Creamos buffers de 1MB con una marca (0xDEADBEEF)
                let b = new ArrayBuffer(1024 * 1024);
                let view = new Uint32Array(b);
                view.fill(0xDEADBEEF);
                this.buffers.push(b);
            }
            this.log(`✓ Spray completado: ${this.buffers.length} MB reservados.`);
        } catch (e) {
            this.log("✗ Límite alcanzado o Sandbox detectado.");
        }
    },

    // 2. Investigación de Use-After-Free (UAF)
    // Intentamos liberar un objeto y acceder a él antes de que el GC lo limpie
    testUAF: function() {
        this.log("Testeando vulnerabilidad Use-After-Free...");
        let target = { data: new Uint32Array(100).fill(0x1337) };
        
        // "Liberamos" la referencia
        let temp = target;
        target = null;
        
        // Forzamos presión de memoria para intentar activar el Garbage Collector
        for(let i=0; i<10000; i++) { let junk = { a: i }; }

        // Intentamos ver si 'temp' sigue apuntando a la memoria original
        if (temp && temp.data[0] === 0x1337) {
            this.log("✓ Objeto persistente tras GC. Interesante...");
        } else {
            this.log("✗ El objeto fue limpiado correctamente.");
        }
    },

    // 3. Búsqueda de punteros filtrados (Leaks)
    // Buscamos valores que parezcan direcciones de memoria (ej: 0x800...)
    searchLeakedPointers: function() {
        this.log("Escaneando buffers en busca de fugas de punteros...");
        let leaks = 0;
        this.buffers.forEach((b, idx) => {
            let view = new Uint32Array(b);
            for(let i=0; i < 100; i++) {
                // Buscamos valores que no pusimos nosotros (distintos a 0xDEADBEEF)
                if(view[i] !== 0xDEADBEEF && view[i] !== 0) {
                    this.log(`!!! Posible Leak en Buffer ${idx}, Offset ${i}: 0x${view[i].toString(16)}`);
                    leaks++;
                }
            }
        });
        if(leaks === 0) this.log("✗ No se detectaron fugas en este ciclo.");
    },

    // 4. Estrés del compilador JIT (Just-In-Time)
    // Intentamos que el motor cambie el tipo de un objeto miles de veces
    stressJIT: function() {
        this.log("Iniciando estrés del compilador JIT...");
        function confuse(obj) {
            return obj.value;
        }

        let obj1 = { value: 1.1 }; // Tipo: Doble
        let obj2 = { value: {} };  // Tipo: Objeto

        // Calentamos el compilador
        for (let i = 0; i < 100000; i++) {
            confuse(obj1);
            if (i % 50000 === 0) confuse(obj2);
        }
        
        this.log("✓ Prueba JIT finalizada. Revisa si el navegador se ralentiza.");
    }
};

window.onload = () => Research.log("Consola de Investigación iniciada. UA: " + navigator.userAgent);