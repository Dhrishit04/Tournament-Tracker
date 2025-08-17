# Stage 1: Build the application with Maven
# We use a specific Maven image that includes a JDK (Java Development Kit) to compile our code.
FROM maven:3.8.5-openjdk-17 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven build file. This is done as a separate step to leverage Docker's layer caching.
# If pom.xml doesn't change, Docker won't re-download dependencies.
COPY pom.xml .

# Download all the project dependencies
RUN mvn dependency:go-offline

# Copy the rest of the source code
COPY src ./src

# Also copy the service account key into the builder stage
COPY serviceAccountKey.json .

# Compile the application and package it into a single, executable JAR file.
RUN mvn package -DskipTests

# Stage 2: Create the final, lean production image
# We use a slim, secure, and widely-used OpenJDK image from the Eclipse Temurin project.
FROM eclipse-temurin:17-jre-alpine

# Set the working directory
WORKDIR /app

# Copy the executable JAR file from the 'builder' stage
COPY --from=builder /app/target/*.jar app.jar

# Copy the service account key from the builder stage. It needs to be available on the classpath.
COPY --from=builder /app/serviceAccountKey.json .

# Expose the port that the Spring Boot application will run on
EXPOSE 8080

# The command to run the application when the container starts
ENTRYPOINT ["java", "-jar", "app.jar"]
