
## web-notepad

forked from: [minimalist-web-notepad](https://github.com/pereorga/minimalist-web-notepad)

<div>
  <img src="https://i.imgur.com/JqqY6EG.png" alt="white" style="float:left;width:50%;padding-right:10px;">
  <img src="https://i.imgur.com/1SUNnQx.png" alt="dark" style="float:right;width:50%;padding-left:10px;">
</div>

### Usage

create a `docker-compose.yml`: 

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

volumes:
  web-note:
```

then `docker-compose up -d`

### from source

to build your image from source code, just use `docker-compose up --build` in the source code directory.

### command line usage

```shell
# push a message
$ curl --data "text=hello world" https://note.mmmm.tech/123

# pull a message
$ curl https://note.mmmm.tech/123
hello world%
```

### Copyright and license

Copyright 2012 Pere Orga pere@orga.cat

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in compliance with the License. You may obtain a copy of the License at:

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
