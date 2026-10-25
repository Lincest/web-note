# Web-Note 

[🔗 Wiki: Lincest/web-note/wiki/web-note-wiki](https://github.com/Lincest/web-note/wiki)

<div align=center>
  <img src="https://i.imgur.com/EfLSz55.png" alt="white" width="45%" hspace="10">
  <img src="https://i.imgur.com/w8DGwoy.png" alt="dark" width="45%" hspace="10">
</div>

##  1. <a name='SelfHost'></a>Self Host

`docker-compose.yml`: 

```yaml
version: "3"
services:
  web-note:
    image: ghcr.io/lincest/web-note:latest
    container_name: web-note
    restart: always
    ports:
     - "80:80"
    volumes:
     - ./data:/var/www/html/_tmp
    # environment: (optional)
    #  FILE_LIMIT: 100000 # the number of files limit (default: 100000)
    #  SINGLE_FILE_SIZE_LIMIT: 102400 # single file size limit, unit: byte (default: 102400)
```

##  2. <a name='FromSource'></a>From Source

### PHP security updates

The image uses PHP 8.4.27, which includes the fixes for CVE-2026-109618 and
CVE-2026-109619 (PHP2Shell). Session upload progress is disabled at startup.
PHP 7.4 images must be replaced; restarting an existing container does not update PHP.
See the [PHP security advisory](https://www.php.net/archive/2026.php#2026-10-21-5).

Back up `./data` before upgrading. For a registry deployment, run
`docker compose pull && docker compose up -d`; for a source deployment, run
`docker compose build --pull && docker compose up -d`.
Confirm the running version with `docker compose exec web-note php -v` and test
reading and saving a note. If a reverse proxy runs on the host, bind the service
to `127.0.0.1:80:80` (or your chosen local port) to prevent direct public access.

to build your image from source code, just clone this repo and use `docker-compose up --build` in the source code directory.

##  3. <a name='CommandlineUsage'></a>Commandline Usage

```shell
# push a message
$ curl --data "text=hello world" https://mmmm.tech/123

# pull a message
$ curl https://mmmm.tech/123
hello world%
```

##  4. <a name='Copyrightandlicense'></a>Copyright and license

this project is forked from: [minimalist-web-notepad](https://github.com/pereorga/minimalist-web-notepad)

Copyright 2012 Pere Orga pere@orga.cat

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in compliance with the License. You may obtain a copy of the License at:

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
