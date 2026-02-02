FROM node:20-alpine

WORKDIR /app

# Simple lifeline bot
RUN npm init -y && npm install node-telegram-bot-api

COPY simple_bot.js ./

CMD ["node", "simple_bot.js"]
