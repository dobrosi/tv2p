# Playwright + Java előre konfigurált image
FROM mcr.microsoft.com/playwright/java:v1.42.0-jammy

# App könyvtár
WORKDIR /app

# JAR bemásolása
COPY target/tv2p-0.0.1-SNAPSHOT.jar app.jar

# Spring port (ha 8085-ön fut)
EXPOSE 8085

# Memory tuning opcionális
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75"

# Indítás
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
