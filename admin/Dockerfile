FROM node
# ENV NODE_ENV production
WORKDIR /app
COPY . /app
RUN make node_modules
RUN make
EXPOSE 3000
CMD /app/node_modules/.bin/next start
