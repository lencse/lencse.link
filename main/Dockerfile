FROM node
# ENV NODE_ENV production
WORKDIR /app
COPY . /app
RUN make
EXPOSE 3000
CMD node /app/server.js
