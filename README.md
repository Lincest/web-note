
## web-notepad

forked from: [minimalist-web-notepad](https://github.com/pereorga/minimalist-web-notepad)

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

volumes:
  web-note:
```

then `docker-compose up -d`

### Copyright and license

Copyright 2012 Pere Orga pere@orga.cat

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in compliance with the License. You may obtain a copy of the License at:

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
