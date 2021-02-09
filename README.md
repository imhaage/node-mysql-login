# Node/MySQL login

Setup project:

```sh
# run containers
docker-compose up -d

# make setup-db.sh executable
chmod +x setup-db.sh

# create database `node-login` & table `users`
./setup-db.sh
```

App : http:localhost:3000
Adminer : http:localhost:8080
