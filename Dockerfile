FROM node:22.20.0-alpine AS builder

ARG TAG
ENV CONT_IMG_VER=${TAG:-latest}

WORKDIR /app/

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./
RUN npm install

ADD . /app/
RUN echo "VUE_APP_VERSION $CONT_IMG_VER" >> .env
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist/ /usr/share/nginx/html/
#COPY --from=builder /app/dist/js /usr/share/nginx/html/js
#COPY --from=builder /app/dist/css /usr/share/nginx/html/css
#COPY --from=builder /app/dist/img /usr/share/nginx/html/img
#COPY --from=builder /app/dist/fonts /usr/share/nginx/html/fonts
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

