FROM node:0.12.4

ENV DEBIAN_FRONTEND noninteractive

# update
RUN apt-get update -qq && apt-get install -y build-essential libkrb5-dev
RUN npm install -g npm@latest 
RUN npm install -g bower 
RUN npm install -g gulp

# copy application
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app/
# RUN rm -rf /usr/src/app/node_modules
RUN cd /usr/src/app; npm install

CMD [ "npm", "start" ]

# Port 3000 for server
# Port 35729 for livereload
EXPOSE 3000 35729
