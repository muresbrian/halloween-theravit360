# 🎃 Guía de Configuración: Google Sheets & Google Apps Script
## Plataforma Oficial Halloween Theravit360 2026

Sigue estos 5 sencillos pasos para dejar listo el backend transaccional en Google Sheets y Google Drive a costo \$0 MXN:

---

### Paso 1: Crear la Hoja de Cálculo en Google Drive
1. Entra a [Google Drive](https://drive.google.com/) con tu cuenta de Google.
2. Haz clic en **+ Nuevo > Hoja de cálculo de Google**.
3. Nómbrala en la esquina superior izquierda: **`Halloween_Theravit360_2026_DB`**.

---

### Paso 2: Abrir el Editor de Apps Script
1. En el menú superior de tu nueva hoja de cálculo, haz clic en **Extensiones > Apps Script**.
2. Se abrirá el editor de código. Verás un archivo llamado `Código.gs` (o `Code.gs`).
3. Borra todo el contenido que tenga por defecto.
4. Abre el archivo local [`google-apps-script/Code.js`](file:///c:/Users/BrianHumbertoMuresGr/Downloads/EMULADORES/halloween-theravit360/google-apps-script/Code.js), copia **todo su contenido** y pégalo en el editor de Apps Script.
5. Haz clic en el icono de **Guardar** (disquete) o presiona `Ctrl + S`.

---

### Paso 3: Inicializar la Base de Datos Automáticamente
1. En la barra de herramientas superior del editor de Apps Script, localiza el selector desplegable de funciones (donde dice `myFunction`).
2. Selecciona la función: **`setupHalloweenDatabase`**.
3. Haz clic en el botón **Ejecutar** (icono de Play ▶).
4. Google te pedirá permisos para modificar la hoja de cálculo y crear carpetas en Drive:
   * Haz clic en **Revisar permisos**.
   * Elige tu cuenta.
   * Si aparece el aviso "Google no ha verificado esta aplicación", haz clic en **Opciones avanzadas** (abajo a la izquierda) y luego en **Ir a Halloween_Theravit360 (no seguro)**.
   * Haz clic en **Permitir**.
5. En el registro de ejecución verás:
   `✅ Base de datos de Halloween Theravit360 inicializada con éxito.`
6. Si regresas a tu hoja de cálculo, verás que automáticamente se crearon con formato y colores profesionales las 9 pestañas:
   * `CONFIG` (con datos iniciales del evento y banco)
   * `TICKET_TYPES` (GENERAL $500 con 200 boletos, VIP $900 con 50 boletos)
   * `CUSTOMERS`
   * `ORDERS`
   * `TICKETS`
   * `PAYMENTS`
   * `CHECK_INS`
   * `ADMINS` (con usuarios: `admin@theravit360.com` / `AdminHalloween2026!` y `puerta@theravit360.com` / `Puerta2026!`)
   * `AUDIT_LOG`

---

### Paso 4: Implementar como Aplicación Web (Web App)
1. En la esquina superior derecha del editor de Apps Script, haz clic en el botón azul **Implementar > Nueva implementación**.
2. Haz clic en el icono de engrane (⚙️) al lado de "Seleccionar tipo" y elige **Aplicación web**.
3. Llena los campos:
   * **Descripción**: `Halloween Backend v3`
   * **Ejecutar como**: `Yo (tu correo)` *(Indispensable para que tenga permiso de escribir en tu hoja)*
   * **Quién tiene acceso**: **`Cualquier persona`** *(Anyone - indispensable para que Next.js pueda comunicarse con ella)*
4. Haz clic en **Implementar**.
5. Se generará una URL larga similar a:
   `https://script.google.com/macros/s/AKfycb.../exec`
6. Copia esa **URL de la aplicación web**.

---

### Paso 5: Conectar con Next.js
1. En tu proyecto de Next.js, abre el archivo `.env.local` (o `.env`).
2. Configura:
   ```env
   GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/TU_CODIGO_AQUI/exec"
   SCRIPT_SECRET_KEY="theravit360_halloween_secret_key_2026"
   ADMIN_SESSION_SECRET="halloween_theravit360_super_secret_jwt_2026_key_#190d2e"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```
3. ¡Listo! Tu plataforma web ahora leerá y escribirá en Google Sheets y guardará los comprobantes en Google Drive en tiempo real.
