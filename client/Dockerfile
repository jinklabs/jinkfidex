FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Vite env vars are baked in at build time — pass them as build args
ARG VITE_API_URL=/api
ARG VITE_PRIVY_APP_ID
ARG VITE_FEE_RECIPIENT_ADDRESS
ARG VITE_ADMIN_ADDRESSES

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_PRIVY_APP_ID=$VITE_PRIVY_APP_ID
ENV VITE_FEE_RECIPIENT_ADDRESS=$VITE_FEE_RECIPIENT_ADDRESS
ENV VITE_ADMIN_ADDRESSES=$VITE_ADMIN_ADDRESSES

RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
