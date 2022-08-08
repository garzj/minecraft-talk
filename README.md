# minecraft-talk

A minecraft plugin allowing players to communicate over a self-hosted website while playing.

## Setup

### Setup the website

1. Clone this repository onto your server.
2. Install [Docker](https://www.docker.com/) and [docker-compose](https://docs.docker.com/compose/install/)
3. Configure [./docker-compose.yml](./docker-compose.yml)
   - Secrets should be generated randomly
   - Replace `8080` with your desired website port
   - The origin should be your ip address with the port of the website or a domain that points to the site (I suggest, you use a reverse proxy to configure SSL)
4. Run `docker-compose up -d` to start up the server

### Setup your minecraft server

1. Download [MinecraftTalk.jar](https://www.spigotmc.org/resources/minecraft-talk.104368/download?version=464729)
2. Move the file into your `plugins/` directory.
3. Reload your minecraft server
4. Configure `plugins/MinecraftTalk/config.yml` with your secret and reload again

## Usage

Enter `/vc` on your server to retrieve a login link to the website.
