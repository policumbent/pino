# pino :evergreen_tree:

Pino il serverino

## Installazione

### Build dell'immagine

1. `docker build -t docker.pkg.github.com/policumbent/pino/pino:latest .`
2. 'docker compose up -d'

### Scaricando l'immagine dal repository

1. 'docker compose up -d'

### Come effettuare la push dell'immagine sul repository

1. (Eseguire solo la prima volta) `Creare un nuovo token github seguendo le istruzioni [qui](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token), con il permesso di scrivere packages e salvalo in un file `~/GH_TOKEN.txt`.
1. (Eseguire solo la prima volta) `cat ~/GH_TOKEN.txt | sudo docker login ghcr.io -u username_github --password-stdin`
2. `sudo docker build -t ghcr.io/policumbent/pino:latest .`
3. `sudo docker push ghcr.io/policumbent/pino:latest`
