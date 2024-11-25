
## Run Melotts API Server
- **Con GPU**: docker run --gpus all -e DEFAULT_SPEED="1.0" -it -p 8080:8080 timhagel/melotts-api-server:latest
- **Con CPU**: docker run -e DEFAULT_SPEED="1.0" -it -p 8080:8080 timhagel/melotts-api-server:latest

