# AI Research Assistant

## Configuration EC2

#### Node.js

```
curl -fsSL https://deb.nodesource.com/setup_current.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Nginx

```
sudo apt update
sudo apt install -y nginx
```

#### Build Client

```From Project Level
sudo mkdir -p ~/var/www/frontend
sudo cp -r dist/* ~/var/www/frontend/
```

```From Root Level
sudo mkdir -p /var/www
sudo rm -rf /var/www/frontend
sudo mv /home/ubuntu/var/www/frontend /var/www/
```

#### Run PM2

```
pm2 start npm --name backend -- start
```

#### Nginx Configuration

```
sudo nano /etc/nginx/sites-available/default

server {
listen 80 default_server;
server_name _;

    root /var/www/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /chat {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /pdf-upload {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}

sudo nginx -t
sudo nginx -s reload
```