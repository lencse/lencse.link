FROM cypress/browsers:node14.16.0-chrome90-ff88

WORKDIR /e2e
COPY . /e2e
RUN yarn --ignore-engines
CMD node_modules/.bin/cypress run --browser chrome --headless
