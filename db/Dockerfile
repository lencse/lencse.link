FROM node
# ENV NODE_ENV production
WORKDIR /app
COPY . /app
RUN make node_modules
CMD make wait_for_db && make migrate
