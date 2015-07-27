FROM node:0.12.4

ENV DEBIAN_FRONTEND noninteractive

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app/
RUN cd /usr/src/app; npm install

CMD [ "node", "/usr/src/app/bin/www" ]

# replace this with your application's default port
EXPOSE 3000

