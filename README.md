![Pino](img/banner.png)

<h3 align="center">🌲 il serverino </h3>

## Development

```sh
docker-compose run --rm pino-dev
```

### Tests

```sh
docker-compose run --rm pino-test
```

## Deploy

**This is already done with a github action**

Create a new github [token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) with write access for packages.

Login with your token as password:

```sh
docker login ghcr.io -u <username>
```

then build and push your image:

```sh
docker-compose build -t ghcr.io/policumbent/pino:latest
docker-compose push ghcr.io/policumbent/pino:latest
```
