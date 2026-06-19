# 🪑 Muebles los Alpes - Portal Corporativo y Catálogo SENA

¡Bienvenido al proyecto oficial de **Muebles los Alpes**! Este repositorio contiene dos versiones del sistema listas para ser exploradas en **Visual Studio Code**:

1. **Versión Completa e Interactiva (Recomendada - React + Vite + Tailwind)**: Incluye el Portal de Clientes con Carrito de Compras en tiempo real y el Panel de Administración de SENA donde puedes añadir productos, gestionar inventarios, ver órdenes y analizar reportes gerenciales con persistencia en `localStorage`.
2. **Versión Estática Tradicional (HTML + CSS + Vanilla JS)**: Una versión ligera sin dependencias de Node, ubicada dentro de la carpeta `/static`, para visualización rápida.

---

## 🚀 ¿Por qué se ve una pantalla blanca al abrir el archivo directamente?
Si descargas el archivo ZIP, lo extraes y haces doble clic directamente en el archivo `index.html` desde tu explorador de archivos, verás una **pantalla blanca**. 

Esto sucede por **seguridad del navegador**:
- Los navegadores modernos bloquean los módulos de JavaScript (`<script type="module">`) cuando se abren mediante el protocolo `file:///` (es decir, haciendo doble clic al archivo sin un servidor local). Esto se conoce como la restricción de origen CORS.
- Para solucionarlo y que todo se vea perfectamente en tu computadora, debes usar **una de las siguientes dos opciones en Visual Studio Code**.

---

## 🛠️ Opción 1: Iniciar la Versión Interactiva (React + Vite) — Recomendada

Esta es la versión principal moderna. Para ejecutarla de manera local en tu computadora:

1. **Abre la carpeta del proyecto** en Visual Studio Code.
2. Abre una **Terminal** en VS Code (`Ctrl + Ñ` o `Menú -> Terminal -> New Terminal`).
3. Instala las dependencias necesarias ejecutando el siguiente comando:
   ```bash
   npm install
   ```
4. Una vez completada la instalación, inicia el servidor de desarrollo local ejecutando el siguiente comando:
   ```bash
   npm run dev
   ```
5. En la terminal verás un enlace similar a `http://localhost:3000` (o `http://localhost:5173`). Haz clic en él manteniendo pulsada la tecla `Ctrl` para abrirlo en tu navegador.
6. ¡Listo! Podrás interactuar con todo el sistema y alternar entre los roles de **Cliente (E-commerce)** y **Administrador (SENA)**.

---

## 🌐 Opción 2: Iniciar la Versión Estática Ligera (HTML + CSS + JS)

Si prefieres explorar la versión ligera sin tener que instalar componentes mediante Node/NPM:

1. **Abre la carpeta del proyecto** en Visual Studio Code.
2. Ve a la sección de extensiones en VS Code (`Ctrl + Shift + X`), busca la extensión **Live Server** (creada por *Ritwick Dey*) e instálala.
3. Abre la carpeta llamada `/static` en tu explorador de archivos izquierdo dentro de VS Code.
4. Selecciona el archivo `/static/index.html`.
5. Haz clic derecho sobre el editor de código o sobre el archivo y selecciona **"Open with Live Server"** (o presiona el botón naranja "Go Live" en la esquina inferior derecha de VS Code).
6. Esto iniciará un microservidor web local (usualmente en `http://127.0.0.1:5500/static/index.html`) que esquivará las restricciones de seguridad de tu navegador y mostrará la página con todos sus estilos e imágenes perfectamente.

---

## 📂 Organización de Archivos

- `/src`: Contiene todo el código fuente en TypeScript de React.
  - `/src/components/ClientPortal.tsx`: Portal de ventas con carrito e interfaz de compras de muebles.
  - `/src/components/AdminPanel.tsx`: Panel administrativo oficial del taller SENA, control de inventario de materias primas, gestión de pedidos e informes gerenciales.
  - `/src/initialData.ts`: Registro inicial de productos, clientes y estados por defecto.
- `/static`: Contiene la versión tradicional alternativa con archivos planos HTML, CSS y JS.
- `/vite.config.ts` y `/package.json`: Configuraciones de empaquetado de producción.

---
*Taller desarrollado como parte de las prácticas académicas de diseño de portales y bases de datos transaccionales de Muebles los Alpes (SENA).*
