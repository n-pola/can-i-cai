FROM node:lts as build

COPY shared /shared
WORKDIR /app
COPY ./frontend/package*.json ./
RUN npm ci
COPY ./frontend .
RUN npm run build

FROM nginx:stable-alpine as runtime
EXPOSE 80

COPY --from=build /app/dist /usr/share/nginx/html
COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf

COPY ./frontend/entrypoint.sh /usr/share/
ENTRYPOINT ["/usr/share/entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]
