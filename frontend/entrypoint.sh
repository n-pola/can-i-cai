#!/bin/sh

if [[ -z "${BACKEND_URL}" ]]; then
  echo "BACKEND_URL is not set. Please set it to run the frontend."
  exit 1
fi

sed -i "s#@@BACKEND_URL@@#${BACKEND_URL}#g" /usr/share/nginx/html/assets/*.js

# TODO: This is quite dirty, split the shared dir into types and schemas later on :w
sed -i "s#import\"cic-shared\";##g" /usr/share/nginx/html/assets/*.js

exec "$@"
