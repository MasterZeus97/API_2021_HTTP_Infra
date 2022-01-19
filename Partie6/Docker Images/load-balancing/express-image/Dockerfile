FROM node:17-alpine3.12

RUN apk update && apk add vim

COPY src/express /opt/app
CMD ["node", "/opt/app/index.js"]

EXPOSE 3000
