FROM sproutupco/alpine-node

WORKDIR /home/node

# update
RUN apk update
RUN npm install -g npm@latest
RUN npm install -g bower
RUN npm install -g gulp

# Install packages
COPY package.json package.json
RUN npm install

# Manually trigger bower. Why doesnt this work via npm install?
COPY .bowerrc .bowerrc
COPY bower.json bower.json
RUN bower install --config.interactive=false --allow-root

COPY config config
COPY modules modules
COPY public public
COPY server.js gulpfile.js ./
COPY .csslintrc .jshintrc license makefile .slugignore ./

CMD [ "npm", "start" ]

# Port 3000 for server
# Port 35729 for livereload
EXPOSE 3000 35729
