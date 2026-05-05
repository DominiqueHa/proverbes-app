# Étape 1 : Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

# Variable d'environnement pour le build
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm build

# Étape 2 : Serveur nginx
FROM nginx:alpine AS production

# Copier le build React
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuration nginx pour React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
