FROM node:lts as build
COPY ./shared /shared
RUN cd /shared && npm ci
WORKDIR /app
COPY ./backend/package*.json /app/
RUN npm ci
COPY ./backend .
RUN npm run build

FROM node:lts-alpine as runtime
ENV PORT=3000
EXPOSE ${PORT}
COPY ./shared /shared
RUN cd /shared && npm ci
WORKDIR /app
COPY ./backend/package*.json /app/
RUN npm ci --omit=dev
COPY --from=build /app/dist/ .
CMD node ./index.js
