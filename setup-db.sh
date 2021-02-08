#!/bin/bash
docker-compose exec db bash -c 'cat tmp/dump.sql | mysql -uroot -proot'