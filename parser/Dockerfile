FROM node:lts
COPY ./shared /shared
RUN cd /shared && npm ci
WORKDIR /app
COPY ./parser/package*.json ./
RUN npm ci
COPY ./parser .
COPY ./data /data
ENV DATA_PATH=/data
RUN npm run build

CMD npm run start:prod
