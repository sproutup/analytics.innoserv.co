environment_name = develop
platform = docker
application_name = analytics
region = us-west-2
keypair = endurance
configuration = analytics
domain = sproutup-co


all: node

master:
	$(eval environment_name := master)

deploy: init
	eb deploy $(application_name)-$(environment_name)

init:
	eb init -r $(region) -p $(platform) -k $(keypair) $(environment_name)

recreate: terminate create

create: init config-put
	eb create $(application_name)-$(environment_name) -c $(application_name)-$(environment_name)-$(domain) --cfg $(configuration)-$(environment_name)

terminate: init
	eb terminate $(application_name)-$(environment_name) --force

build:
	docker build -t $(application_name) .

rebuild: stop delete build run

stop:
	docker stop $(application_name)

restart: stop start

start:
	docker start $(application_name)

run:
	docker run -d -p 3000:3000 --name $(application_name) --env-file local-env.list $(application_name)

delete: init
	docker rm $(application_name)

node:
	gulp

config-save:
	eb config save $(configuration) --cfg $(configuration)

config: init config-put
	eb config $(application_name)-$(environment_name) --cfg $(application_name)-$(environment_name)

config-put: init
	eb config put $(application_name)-$(environment_name)
