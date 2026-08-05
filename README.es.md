<div align="center">
  <h1>InterMaps</h1>
  <p><b>Un sistema interactivo de mapas del campus y navegación híbrida.</b></p>
</div>

InterMaps es un proyecto de diseñado para resolver los problemas de orientación y logística dentro del campus, proporciona un mapa centralizado e interactivo que detalla la ubicación exacta de edificios, rutas al aire libre, aulas, oficinas y laboratorios.

El sistema opera bajo una arquitectura de monorepositorio, diseñado para ejecutarse localmente en hardware embebido (pantallas de kiosco) y dinámicamente en dispositivos móviles.

<div align="center">
  <h3> Arquitectura: Web • Local Embebido • Móvil </h3>
</div>

## Características Principales
* **Enrutamiento basado en Grafos:** Calcula la ruta peatonal óptima entre instalaciones utilizando el algoritmo de Dijkstra.
* **Búsqueda Inteligente:** Barra de búsqueda con autocompletado para localizar rápidamente aulas u oficinas administrativas.
* **Capacidad Offline-First:** Soporte de ejecución local mediante SQLite para un funcionamiento ininterrumpido sin dependencia de conexión a internet externa.
* **Interfaz Multiplataforma:** API unificada que da servicio tanto a un cliente web de kiosco como a una aplicación móvil nativa.

## Stack Tecnológico
**Motor Backend**
* Java 17
* Spring Boot 4.1.0
* SQLite 

**Frontend (Kiosco / Web)**
* React.js
* TypeScript
* Vite

**Frontend (Móvil)**
* React Native
* TypeScript
* Expo

## Prerrequisitos
Asegúrese de tener instalado lo siguiente en su entorno de desarrollo:
* [JDK 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
* [Maven](https://maven.apache.org/)
* [Node.js](https://nodejs.org/en) (v18 o superior)

## Instalación y Desarrollo Local

Al ser un monorepositorio, los clientes backend y frontend deben iniciarse por separado.

### 1. Iniciar la API Backend
Navegue al directorio del backend y ejecute la aplicación Spring Boot:
```bash
cd backend
./mvnw spring-boot:run