# --- Этап сборки: собираем статику Vite ---
FROM node:22-alpine AS build

WORKDIR /app

# Сначала зависимости — слой кешируется, пока не менялся lock-файл.
COPY package.json package-lock.json ./
RUN npm ci

# Затем исходники и сама сборка (tsc --noEmit + vite build).
COPY . .
RUN npm run build

# --- Этап раздачи: отдаём собранный SPA через nginx ---
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Базовый образ nginx запускает мастер-процесс в foreground — дополнительный CMD не нужен.
