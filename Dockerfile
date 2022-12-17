FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "npm", "run", "start" ]

# COMMANDS TO USE THIS IMAGE
# docker build . -t songguesser_backend
# docker run -p 49160:8080 -d songguesser_backend
# docker kill <container id>