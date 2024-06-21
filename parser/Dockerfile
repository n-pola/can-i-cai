FROM node:lts as build
COPY ./shared /shared
RUN cd /shared && npm ci
WORKDIR /app
COPY ./parser/package*.json ./
RUN npm ci
COPY ./parser .
COPY ./data /data
ENV DATA_PATH=/data
RUN npm run build

FROM node:lts-alpine as runtime
COPY ./shared /shared
RUN cd /shared && npm ci
WORKDIR /app
COPY ./parser/package*.json /app/
RUN npm ci --omit=dev
COPY --from=build /app/dist/ .
COPY ./data /data
ENV DATA_PATH=/data
CMD node ./index.js
