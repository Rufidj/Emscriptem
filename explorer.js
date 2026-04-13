// PS5 File Explorer - Intento de acceso a sistema de archivos
let logBuffer = [];

function log(msg) {
    const timestamp = new Date().toLocaleTimeString();
    const fullMsg = `[${timestamp}] ${msg}`;
    logBuffer.push(fullMsg);
    document.getElementById('log').textContent = logBuffer.join('\n');
    document.getElementById('log').scrollTop = document.getElementById('log').scrollHeight;
}

function limpiarLog() {
    logBuffer = [];
    document.getElementById('log').textContent = 'Log limpiado.';
}

// Intento 1: Acceso directo vía fetch
async function intentoFetch(ruta) {
    log(`[FETCH] Intentando acceso a: ${ruta}`);
    try {
        const response = await fetch(ruta);
        if (response.ok) {
            const text = await response.text();
            log(`✓ FETCH exitoso: ${ruta} (${text.length} bytes)`);
            return text;
        } else {
            log(`✗ FETCH: ${ruta} - Status ${response.status}`);
        }
    } catch (e) {
        log(`✗ FETCH error: ${ruta} - ${e.message}`);
    }
    return null;
}

// Intento 2: XMLHttpRequest
async function intentoXHR(ruta) {
    log(`[XHR] Intentando acceso a: ${ruta}`);
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    log(`✓ XHR exitoso: ${ruta}`);
                    resolve(xhr.responseText);
                } else {
                    log(`✗ XHR: ${ruta} - Status ${xhr.status}`);
                    resolve(null);
                }
            }
        };
        xhr.onerror = () => {
            log(`✗ XHR error: ${ruta}`);
            resolve(null);
        };
        xhr.open('GET', ruta, true);
        xhr.send();
    });
}

// Intento 3: WebAssembly - Acceso indirecto
function testWebAssembly() {
    log(`[WASM] Testeando acceso a WebAssembly...`);
    
    // Método 1: Acceso directo
    try {
        if (typeof WebAssembly !== 'undefined') {
            log(`✓ WebAssembly disponible directamente`);
            log(`  - Métodos: ${Object.keys(WebAssembly).join(', ')}`);
            return true;
        }
    } catch (e) {
        log(`✗ WebAssembly directo: ${e.message}`);
    }
    
    // Método 2: Via globalThis
    try {
        if (typeof globalThis !== 'undefined' && globalThis.WebAssembly) {
            log(`✓ WebAssembly vía globalThis`);
            return true;
        }
    } catch (e) {
        log(`✗ globalThis.WebAssembly: ${e.message}`);
    }
    
    // Método 3: Via window
    try {
        if (window.WebAssembly) {
            log(`✓ WebAssembly vía window`);
            return true;
        }
    } catch (e) {
        log(`✗ window.WebAssembly: ${e.message}`);
    }
    
    // Método 4: Via Function
    try {
        const wasm = Function('return this.WebAssembly')();
        if (wasm) {
            log(`✓ WebAssembly vía Function()`);
            return true;
        }
    } catch (e) {
        log(`✗ Function() WebAssembly: ${e.message}`);
    }
    
    // Método 5: Via eval (último recurso)
    try {
        const wasm = eval('WebAssembly');
        if (wasm) {
            log(`✓ WebAssembly vía eval()`);
            return true;
        }
    } catch (e) {
        log(`✗ eval() WebAssembly: ${e.message}`);
    }
    
    log(`✗ WebAssembly NO disponible por ningún método`);
    return false;
}

// Intento 4: Listar archivos vía fetch de un índice
async function listarDirectorio(ruta) {
    log(`\n=== LISTANDO DIRECTORIO: ${ruta} ===`);
    
    // Algunas rutas comunes en PS5
    const rutas = [
        ruta,
        `${ruta}/`,
        `file://${ruta}`,
        `file:///${ruta}`,
    ];
    
    for (const r of rutas) {
        const resultado = await intentoFetch(r);
        if (resultado) {
            log(`Contenido de ${r}:`);
            log(resultado.substring(0, 1000));
            return resultado;
        }
    }
    
    log(`✗ No se pudo acceder a ${ruta} por ninguna forma`);
}

// Intento 5: Buscar archivos específicos conocidos
async function buscarArchivos() {
    log(`\n=== BUSCANDO ARCHIVOS CONOCIDOS ===`);
    
    const archivosComunes = [
        '/etc/passwd',
        '/etc/hostname',
        '/proc/version',
        '/proc/self/environ',
        '/sys/class/net/eth0/address',
        '/dev/null',
        '/dev/zero',
        '/mnt/usb/index.html',
        '/media/index.html',
        '/..',
        '/../../',
        '/home',
        '/root',
        '/opt',
        '/var/tmp',
    ];
    
    for (const archivo of archivosComunes) {
        const resultado = await intentoFetch(archivo);
        if (resultado && resultado.length > 0) {
            log(`✓ ENCONTRADO: ${archivo}`);
            log(`  Contenido (primeros 200 chars): ${resultado.substring(0, 200)}`);
        }
    }
}

// Funciones principales
async function explorarRaiz() {
    testWebAssembly();
    await buscarArchivos();
    await listarDirectorio('/');
}

async function explorarDev() {
    await listarDirectorio('/dev');
}

async function explorarHome() {
    await listarDirectorio('/home');
}

async function explorarTmp() {
    await listarDirectorio('/tmp');
}

async function explorarSys() {
    await listarDirectorio('/sys');
}

async function explorarProc() {
    await listarDirectorio('/proc');
}

async function explorarRuta() {
    const ruta = document.getElementById('pathInput').value.trim();
    if (!ruta) {
        log('Por favor ingresa una ruta');
        return;
    }
    await listarDirectorio(ruta);
}

// Intento 6: Cargar WASM malicioso
async function intentoWasm() {
    log(`\n=== INTENTO WASM MALICIOSO ===`);
    
    // Mínimo WASM válido que no hace nada pero prueba la carga
    const wasmBinary = new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, // \0asm
        0x01, 0x00, 0x00, 0x00, // version 1
    ]);
    
    try {
        const wasmModule = await WebAssembly.instantiate(wasmBinary);
        log(`✓ WASM cargado exitosamente`);
        return wasmModule;
    } catch (e) {
        log(`✗ WASM no permitido: ${e.message}`);
    }
}

// Intento 7: Acceso a APIs del navegador PS5
function explorarAPIs() {
    log(`\n=== EXPLORANDO APIs DISPONIBLES ===`);
    
    const apis = [
        'navigator',
        'window',
        'document',
        'fetch',
        'XMLHttpRequest',
        'WebWorker',
        'SharedArrayBuffer',
        'Intl',
        'WebGL',
        'WebRTC',
        'Bluetooth',
        'localStorage',
        'sessionStorage',
        'indexedDB',
    ];
    
    for (const api of apis) {
        try {
            const obj = eval(api);
            if (obj) {
                log(`✓ ${api} disponible`);
            }
        } catch (e) {
            log(`✗ ${api} no disponible`);
        }
    }
    
    // Navigator específico
    log(`\n--- Navigator Info ---`);
    log(`User Agent: ${navigator.userAgent}`);
    log(`Platform: ${navigator.platform}`);
    log(`Hardware Concurrency: ${navigator.hardwareConcurrency}`);
    log(`Device Memory: ${navigator.deviceMemory || 'N/A'}`);
}

// Autoejecutar al cargar
window.addEventListener('load', () => {
    log('🎮 PS5 File Explorer iniciado');
    explorarAPIs();
});
