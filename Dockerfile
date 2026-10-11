# syntax=docker/dockerfile:1
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 1000000
COPY frontend/ .
RUN yarn build
# Copy standalone HTML pages that aren't part of Angular app
RUN mkdir -p /app/build/browser && cp /app/src/terminal.html /app/src/demo.html /app/build/browser/ 2>/dev/null || true

# ----

FROM python:3.12-slim AS build-backend
ARG EXTRA_DEPS

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libmariadb-dev \
    libffi-dev \
    libssl-dev \
    pkg-config \
    curl \
    bash \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN python -m venv /app/venv

COPY backend/requirements.txt ./
RUN /app/venv/bin/pip install --no-cache-dir -r requirements.txt

COPY backend/manage.py backend/gunicorn.conf.py ./
COPY backend/tabby tabby
COPY --from=frontend-build /app/build/browser /frontend

ARG BUNDLED_TABBY=1.0.231-nightly.0

RUN mkdir -p /app/public/static && cp -r /frontend/* /app/public/static/ && FRONTEND_BUILD_DIR=/frontend /app/venv/bin/python ./manage.py collectstatic --noinput
RUN APP_DIST_STORAGE=file:///app-dist /app/venv/bin/python ./manage.py add_version ${BUNDLED_TABBY}

# ----

FROM python:3.12-slim AS backend

ENV APP_DIST_STORAGE file:///app-dist
ENV DOCKERIZE_VERSION v0.15.0
ENV DOCKERIZE_ARCH amd64
ARG TARGETPLATFORM
RUN apt-get update && apt-get install -y --no-install-recommends \
    mariadb-client \
    wget \
    && rm -rf /var/lib/apt/lists/*

RUN if [ "$TARGETPLATFORM" = "linux/arm64" ]; \
    then export DOCKERIZE_ARCH=armhf; \
    else export DOCKERIZE_ARCH=amd64; \
    fi
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-$DOCKERIZE_ARCH-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-$DOCKERIZE_ARCH-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-$DOCKERIZE_ARCH-$DOCKERIZE_VERSION.tar.gz

# Copy everything from build stage (includes /app/venv with all packages)
COPY --from=build-backend /app /app
COPY --from=build-backend /app-dist /app-dist

COPY backend/start.sh backend/manage.sh /
RUN chmod +x /start.sh /manage.sh
CMD ["/start.sh"]
