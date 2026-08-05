<div align="center">
  <h1>InterMaps</h1>
  <p><b>An interactive campus mapping system for the Instituto Tecnológico de Nuevo León.</b></p>
</div>

InterMaps is a project designed to solve orientation and logistics challenges within the campus. It provides a centralized, interactive map detailing the exact location of buildings, classrooms, offices, and laboratories. 

The system operates under a monorepo architecture, designed to run locally on embedded hardware (kiosk displays) and dynamically on mobile devices.

<div align="center">
  <h3> Architecture: Web • Local Embedded • Mobile </h3>
</div>

## Core Features 
* **Graph-Based Routing:** Calculates the optimal walking route between facilities using Dijkstra's algorithm.
* **Smart Search:** Search bar with autofill capabilities to quickly locate specific rooms or administrative offices.
* **Offline-First Capabilities:** Local execution support via SQLite for seamless operation without external internet dependency.
* **Cross-Platform Interface:** Unified API serving both a web-based kiosk client and a native mobile application.

## Tech Stack
**Backend Engine**
* Java 17
* Spring Boot 4.1.0
* SQLite 

**Frontend (Kiosk / Web)**
* React.js
* TypeScript
* Vite

**Frontend (Mobile)**
* React Native
* TypeScript
* Expo

##  Requirements
Ensure your development environment has the following installed:
* [JDK 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
* [Maven](https://maven.apache.org/)
* [Node.js](https://nodejs.org/en) (v18 or higher)

## Installation & Local Development

Since this is a monorepo, the backend and frontend clients must be started separately.

### 1. Start the Backend API
Navigate to the backend directory and run the Spring Boot application:
```bash
cd backend
./mvnw spring-boot:run
