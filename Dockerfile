FROM node:lts-alpine
ENV NODE_ENV=development
ENV USER_SERVICE_PORT=3004
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE ${USER_SERVICE_PORT}
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]
