**Sistema de Gestión Escolar - Colegio Los Pinos**

Descripción del Proyecto:
Este sistema es un MVP (Producto Mínimo Viable) desarrollado para la digitalización de procesos académicos del Colegio Primaria Los Pinos. Permite la gestión integral de alumnos, grupos y materias, la captura de calificaciones bimestrales y la consulta de historial académico mediante perfiles diferenciados para Maestros y Padres.

Se optó por una arquitectura Headless utilizando React + Vite para el frontend y Supabase como Backend-as-a-Service (BaaS). Esta elección garantiza persistencia real de datos, seguridad a nivel de fila (RLS) y un despliegue escalable.

_____________________________________________________________________________________________________________________________________________________________________________________________________________________

**Stack Tecnológico**
 > * **Frontend:** React 18 + Vite (Velocidad de desarrollo y hot-reload).
 > * **Estilos:** Tailwind CSS (Diseño responsive y UX profesional).
 > * **Backend & DB:** Supabase (PostgreSQL) con autenticación nativa.
 > * **Generación de Reportes:** `jspdf` / `react-pdf` para boletas oficiales.
 > * **Despliegue:** Vercel (CI/CD integrado con GitHub).

_____________________________________________________________________________________________________________________________________________________________________________________________________________________

**Requerimientos Implementados**:
> * **Gestión Académica:** Administración de alumnos, grupos y materias.
> * **Carga de Calificaciones:** Sistema bimestral (escala 0-10).
> * **Dashboard de Maestros:** Panel con indicadores de carga pendiente.
> * **Portal de Padres:** Consulta de historial y promedios en tiempo real.
> * **Reportes PDF:** Generación de boletas individuales descargables.
> * **Notificaciones Inteligentes:** Sistema visual de alertas para calificaciones bajo el estándar (< 7).

_____________________________________________________________________________________________________________________________________________________________________________________________________________________

**Lógica de Negocio & Acuerdos con el Cliente**

Para este MVP, se establecieron las siguientes reglas de cálculo y gestión (Confirmadas vía Email 08/04/2026):

* **Ciclo Escolar:** Dividido en 4 Bimestres.
* **Estructura de Calificaciones:** 5 notas parciales por materia/bimestre.
* **Cálculo de Promedio:** * Promedio simple automático.
* **Restricción:** El promedio solo se proyecta si existen ≥ 3 notas cargadas.
* **Cierre de Bimestre:** Discrecional del docente (permite cerrar con menos de 5 notas si las instancias evaluativas fueron menores).
* **Integridad de Datos:** Las materias pueden ser gestionadas (Alta/Baja/Modificación) exclusivamente por perfiles Administrativos.

> Actualización de Requerimientos de Interfaz (09/04/2026)

Tras la última revisión con el cliente, se han integrado los siguientes estándares técnicos para garantizar la accesibilidad y portabilidad del sistema:

### 1. Diseño Adaptativo Multi-dispositivo (Responsive Design)
La interfaz ha sido reconstruida bajo una metodología **Mobile-First**, asegurando una experiencia fluida mediante el uso de **Tailwind CSS** y **CSS Grid/Flexbox**.
* **Mobile (<768px):** Vistas simplificadas con menús colapsables y tablas con scroll horizontal optimizado.
* **Tablets (768px - 1199px):** Layouts de dos columnas para gestión de materias y listas de alumnos.
* **Desktop (1200px+):** Aprovechamiento total del ancho de pantalla para planillas de calificación extensas y paneles administrativos.

### 2. Optimización de Interacción (Touch-friendly)
Se han ajustado todos los elementos interactivos para entornos táctiles:
* **Áreas de contacto:** Botones y selectores con un tamaño mínimo de **44x44px** para evitar errores de precisión.
* **Inputs de Calificación:** Optimizados para el despliegue de teclados numéricos nativos en dispositivos móviles.
* **Navegación:** Gestos de desplazamiento suaves y feedback visual inmediato al tacto.

### 3. Progressive Web App (PWA) - Plus de Portabilidad
El sistema incluye soporte para capacidades **PWA**, permitiendo:
* **Instalación nativa:** Posibilidad de añadir el sistema a la pantalla de inicio en Android/iOS como una aplicación independiente.
* **Brand Identity:** Configuración de manifiesto con iconos institucionales y colores corporativos (Indigo/Slate).
* **Acceso Rápido:** Tiempos de carga reducidos mediante estrategias de caché para los activos críticos de la interfaz.

_____________________________________________________________________________________________________________________________________________________________________________________________________________________

Setup & Instalación
1. Clonar el repositorio: `git clone [URL]`
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno (`.env`):
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
4. Ejecutar en local: `npm run dev`


