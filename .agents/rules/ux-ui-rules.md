# Directrices de Diseño UX/UI y Reportes — Frontend Angular (APF2)

Este archivo formaliza los principios de diseño de interfaz, paleta visual y cobertura de pantallas especificados en el **Capítulo 7 de `Grupo4-DWI-APF2.docx`**.

---

## 1. Cobertura de las 11 Pantallas Oficiales del Prototipo (Tabla 38)

| N.° | Pantalla | Módulo | Requerimientos / Casos de Uso | Ubicación en APF2 |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Inicio de Sesión** | Acceso | `RF-01` a `RF-04` · `CU-01` | Figura 6 |
| **2** | **Panel Principal (Dashboard)** | Dashboard | `RF-18`, `RF-33`, `RF-34` · `CU-10` | Anexo B |
| **3** | **Calendario de Citas** | Citas | `RF-16` a `RF-19` · `CU-04`, `CU-05` | Anexo C |
| **4** | **Nueva Cita con Disponibilidad**| Citas | `RF-13` a `RF-15` · `CU-04`, `CU-05` | Figura 7 |
| **5** | **Registro Propietario y Mascota**| Expedientes | `RF-05` a `RF-12` · `CU-02`, `CU-03` | Figura 8 |
| **6** | **Expedientes (Ficha, Historial, Vacunas)**| Expedientes | `RF-24` a `RF-26` · `CU-08` | Anexo D |
| **7** | **Consulta Médica y Calculadora de Dosis**| Consultas | `RF-20` a `RF-23` · `CU-06`, `CU-07` | Anexo E |
| **8** | **Inventario y Control de Lotes** | Inventario | `RF-27` a `RF-35` · `CU-09`, `CU-10` | Anexo F |
| **9** | **Reporte de Citas** | Reportes | `RF-36` · `CU-11` | Figura 9 |
| **10**| **Reporte de Historia Clínica** | Reportes | `RF-37` · `CU-11` | Figura 10 |
| **11**| **Reporte de Inventario (Estado y Vencimiento)**| Reportes | `RF-38`, `RF-39` · `CU-11` | Figura 11 |

---

## 2. Menú de Navegación por Perfil de Rol (Tabla 40)

La barra lateral de navegación (`SidebarComponent`) debe renderizar reactivamente las opciones disponibles según el rol autenticado en el token JWT:

* **Administrador / Recepcionista:**
  - Panel Principal (Dashboard)
  - Citas (Calendario y Nueva Cita)
  - Expedientes (Propietarios, Pacientes y Vacunas)
  - Reportes (Citas, Pacientes)
* **Veterinario Especialista:**
  - Panel Principal
  - Citas (Turnos del día)
  - Expedientes Clínicos
  - Consulta Médica (Triaje, Diagnóstico, Recetas y Calculadora de Dosis)
* **Encargado de Inventario:**
  - Panel Principal
  - Inventario de Medicamentos e Insumos
  - Kardex de Movimientos y Control de Lotes
  - Reportes de Inventario (Stock bajo y próximos a vencer)

---

## 3. Principios Visuales y Paleta con Tailwind CSS

* **Tipografía moderna:** Inter o Roboto.
* **Badges semánticos para estados de citas:**
  - `Programada`: Azul cielo (`bg-sky-100 text-sky-800 border-sky-300`).
  - `Atendida`: Verde esmeralda (`bg-emerald-100 text-emerald-800 border-emerald-300`).
  - `Cancelada`: Rojo coral (`bg-rose-100 text-rose-800 border-rose-300`).
* **Badges para alertas de stock de inventario:**
  - `Stock Óptimo`: Verde (`bg-teal-100 text-teal-800`).
  - `Stock Bajo`: Naranja ámbar (`bg-amber-100 text-amber-800`).
  - `Agotado / Crítico`: Rojo (`bg-rose-100 text-rose-800`).
* **Exportación de datos:** Todas las tablas de reportes deben incluir botones de acción rápida para exportar en formatos **PDF** y **CSV** (Sección 7.4).
