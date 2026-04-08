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

Setup & Instalación
1. Clonar el repositorio: `git clone [URL]`
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno (`.env`):
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
4. Ejecutar en local: `npm run dev`


