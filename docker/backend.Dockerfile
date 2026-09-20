FROM eclipse-temurin:25-jdk AS build

WORKDIR /app

COPY backend/mvnw backend/mvnw
COPY backend/.mvn backend/.mvn
COPY backend/pom.xml backend/pom.xml

RUN chmod +x backend/mvnw && ./backend/mvnw -f backend/pom.xml -q -DskipTests dependency:go-offline

COPY backend/src backend/src

WORKDIR /app/backend

RUN ./mvnw -q -DskipTests package && cp target/*.jar app.jar

FROM eclipse-temurin:25-jre

WORKDIR /app

COPY --from=build /app/backend/app.jar app.jar
COPY web/public/edificios.geojson /app/web/public/edificios.geojson

ENV INTERMAPS_FRONTEND_MAP_PATH=/app/web/public/edificios.geojson

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
