FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    unzip \
  && curl -fsSL https://rclone.org/install.sh | bash \
  && curl -fsSL https://pgp.mongodb.com/server-8.0.asc \
    | gpg --dearmor -o /usr/share/keyrings/mongodb-server-8.0.gpg \
  && echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/debian bookworm/mongodb-org/8.0 main" \
    > /etc/apt/sources.list.d/mongodb-org-8.0.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends mongodb-database-tools \
  && rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --shell /usr/sbin/nologin dbbackup

COPY backup.sh /usr/local/bin/backup.sh
RUN chmod 755 /usr/local/bin/backup.sh

USER dbbackup
WORKDIR /tmp

ENTRYPOINT ["/usr/local/bin/backup.sh"]
