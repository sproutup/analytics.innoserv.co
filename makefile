environment_name = develop
platform = docker
application_name = analytics
region = us-west-2
keypair = endurance
configuration = analytics
domain = sproutup-co


all: deploy

master:
	$(eval environment_name := master)

deploy: init
	eb deploy

init:
	eb init -r $(region) -p $(platform) -k $(keypair) $(environment_name)

recreate: terminate create

create: init
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
	docker run -d -p 3002:3002 --name $(application_name) --env-file local-env.list $(application_name)

delete: init
	docker rm $(application_name)

node:
	AWS_ACCESS_KEY_ID=AKIAJM5X5NV444LJEUSA \
	AWS_SECRET_ACCESS_KEY=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 \
	AWS_SQS_REGION=us-west-2 \
	AWS_QUEUE_NAME=testSQS \
	SENDGRID_USERNAME=sproutup \
	SENDGRID_PASSWORD='1nter$$Tellar' \
	npm start

config-save:
	eb config save $(configuration) --cfg $(configuration)

config:
	eb config $(configuration) --cfg $(configuration)

config-put:
	eb config put $(configuration)
