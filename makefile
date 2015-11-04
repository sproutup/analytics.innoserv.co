target = develop
platform = docker
application_name = analytics
region = us-west-2
keypair = endurance
configuration = analytics
domain = sproutup-co
repo = sproutupco


all: node

master:
	$(eval target := master)

develop:
	$(eval target := develop)

build:
	docker build -t $(repo)/$(application_name):$(target) .

push: build
	docker push $(repo)/$(application_name):$(target)

rebuild: stop delete build run

stop:
	docker stop $(repo)/$(application_name):$(target)

restart: stop start

start:
	docker start $(repo)/$(application_name):$(target)

run:
	docker run -d -p 3000:3000 --name $(application_name) --net="host" --env-file local-env.list $(application_name)

runia:
	docker run -it -p 3000:3020 --env-file local-env.list --net="host" -t $(repo)/$(application_name) /bin/sh

delete: init
	docker rm $(application_name)

node:
	gulp

deploy: push
	$(MAKE) -C target $(target) deploy

