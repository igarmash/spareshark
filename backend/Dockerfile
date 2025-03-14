FROM eclipse-temurin:17-jdk as build
WORKDIR /workspace/app

# Copy pom.xml first for better layer caching
COPY pom.xml .

# Install Maven
RUN apt-get update && apt-get install -y maven

# Download dependencies as a separate step to take advantage of Docker cache
RUN mvn dependency:go-offline -B

# Copy the project source
COPY src src

# Build the application
RUN mvn package -DskipTests
RUN mkdir -p target/dependency && (cd target/dependency; jar -xf ../*.jar)

FROM eclipse-temurin:17-jre
VOLUME /tmp
ARG DEPENDENCY=/workspace/app/target/dependency

# Copy the dependency application layer by layer
COPY --from=build ${DEPENDENCY}/BOOT-INF/lib /app/lib
COPY --from=build ${DEPENDENCY}/META-INF /app/META-INF
COPY --from=build ${DEPENDENCY}/BOOT-INF/classes /app

# Run as non-root
RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

ENTRYPOINT ["java","-cp","app:app/lib/*","com.teko.spareshark.SparesharkApplication"]