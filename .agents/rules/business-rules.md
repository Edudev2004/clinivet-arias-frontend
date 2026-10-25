# Reglas de Negocio en Frontend — Clinivet Arias (APF2)

Este archivo formaliza las **Reglas de Negocio (RN)** aplicadas a la experiencia de usuario, formularios reactivos y validaciones del cliente en Angular 17 según **`Grupo4-DWI-APF2.docx`**.

---

## 1. Validaciones Reactivas por Módulo

| Regla de Negocio | Aplicación en Interfaz de Usuario (Angular) |
| :--- | :--- |
| **RN-01 (Mascota - Propietario)** | El formulario de registro de mascota debe solicitar primero la búsqueda o selección de un propietario existente, o permitir el flujo asistido en dos pasos (Propietario $\rightarrow$ Mascota). |
| **RN-02 (Cita)** | Al crear una cita, los campos de Mascota y Veterinario son obligatorios con selectores reactivos. |
| **RN-03 (No solapamiento)** | Al seleccionar veterinario y fecha, el calendario debe consultar los turnos ocupados y **deshabilitar visualmente las horas no disponibles** para prevenir errores antes del envío. |
| **RN-04 (Restricción por Rol)** | El menú de navegación y las rutas de consulta clínica deben estar protegidas por `AuthGuard` y `RoleGuard`. La opción de emitir diagnósticos y recetas solo es visible para el rol `VETERINARIO`. |
| **RN-05 (Stock no negativo)** | En formularios de salidas de inventario, el input numérico de cantidad debe tener `max = lote.cantidadActual`. Bloquear el botón de envío si se supera el stock disponible. |
| **RN-06 (Alertas de stock)** | Badges visuales de advertencia en color naranja/rojo en la tabla de inventario cuando `stock_actual <= stock_minimo`. |
| **RN-07 (Borrado lógico)** | Las citas canceladas se muestran tachadas o con badge rojo "Cancelada"; la acción en la interfaz es "Cancelar Cita" con confirmación modal, nunca "Eliminar". |
| **RN-10 (PEPS / FIFO)** | Al dispensar medicamentos, la interfaz debe preseleccionar por defecto el lote activo con fecha de vencimiento más próxima. |
| **RN-12 (Cálculo de Dosis)** | En la pantalla de consulta médica, al ingresar el peso de la mascota y la dosis por kg del medicamento, la interfaz debe calcular reactivamente la **Dosis Total en mg** en tiempo real: `dosis_total = peso * dosis_por_kg`. |
