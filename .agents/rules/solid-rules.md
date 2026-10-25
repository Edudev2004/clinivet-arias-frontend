# Reglas de Diseño y Principios SOLID — Frontend (Angular / TypeScript)

El desarrollo del frontend de Clinivet Arias debe seguir rigurosamente los **5 principios SOLID** dentro de la arquitectura Feature-Driven.

---

### 1. S — Single Responsibility Principle (Responsabilidad Única)
* **Componentes (`*.component.ts`):** Únicamente responsables de la lógica de presentación y respuesta a eventos de la interfaz (clicks, inputs, formularios). **Nunca hacer llamadas `HttpClient` directas desde componentes**.
* **Servicios (`*.service.ts`):** Encapsulan el 100% de la comunicación HTTP (`HttpClient`), manejo de cabeceras, parámetros, caché y estado reactivo (Signals / RxJS).
* **Pipes y Directivas:** Responsabilidades aisladas de formateo visual y manipulación de comportamiento del DOM.

---

### 2. O — Open / Closed Principle (Abierto / Cerrado)
* Componentes reutilizables en `shared/` (botones, modales, tablas) diseñados para ser extensibles mediante:
  * Inputs configurables (`@Input()` o `input()` signals).
  * Proyección de contenido (`<ng-content>`).
  * Sin necesidad de modificar el código interno del componente para cada nuevo caso de uso.

---

### 3. L — Liskov Substitution Principle (Sustitución de Liskov)
* Las interfaces y tipos en `models/` deben ser respetados fielmente.
* Cualquier implementación alternativa de un servicio de datos o mock para tests debe poder sustituir al servicio real sin romper los componentes consumidores.

---

### 4. I — Interface Segregation Principle (Segregación de Interfaces)
* Diseñar interfaces y tipos pequeños y específicos para cada caso de uso:
  * Separar requests de responses (ej. `LoginRequest`, `LoginResponse`, `CitaCreateRequest`, `CitaResponse`).
  * Evitar modelos gigantes con decenas de atributos opcionales (`?`) que dificultan el tipado estricto.

---

### 5. D — Dependency Inversion Principle (Inversión de Dependencias)
* Los componentes nunca crean instancias con `new`, siempre consumen servicios inyectados:
  * Usar la función moderna `inject(MiServicio)` o inyección por constructor de Angular 17.
  * Interceptores funcionales (`jwtInterceptor`, `errorInterceptor`) para desacoplar la seguridad de las llamadas individuales.
