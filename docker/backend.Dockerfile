FROM eclipse-temurin:25-jdk

WORKDIR /app

COPY backend/mvnw backend/mvnw
COPY backend/.mvn backend/.mvn
COPY backend/pom.xml backend/pom.xml

RUN chmod +x backend/mvnw && ./backend/mvnw -f backend/pom.xml -q -DskipTests dependency:go-offline

COPY backend/src backend/src

WORKDIR /app/backend

EXPOSE 8080

CMD ["./mvnw", "spring-boot:run"]
