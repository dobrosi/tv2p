#git clone https://github.com/dobrosi/tv2p.git
git pull
./mvnw clean package -DskipTests

docker build -t tv2p .

