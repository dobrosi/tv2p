#!/bin/bash

./stop.sh

# Az aktuális script elérési útja
SCRIPT_DIR=$(dirname "$(realpath "$0")")

# Lépj a script könyvtárába
cd "$SCRIPT_DIR" || exit 1

unset spring_config_location

nohup java -Dspring.application.name=tv2p --add-opens java.xml/com.sun.org.apache.xml.internal.serialize=ALL-UNNAMED -jar target/tv2p-0.0.1-SNAPSHOT.jar &

