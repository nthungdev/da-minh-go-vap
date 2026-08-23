# Da Minh Go Vap

## Getting Started

It is recommended to use [pnpm](https://pnpm.io/) as the package manager for this project. Assuming you have Node, pnpm can be activated by running:

```bash
corepack enable pnpm
```

Install dependencies:

```bash
pnpm install
```

Generate typescript types for PayloadCMS:

```bash
pnpm generate
```

Generate PayloadCMS secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Environment Variables

Create a `.env.local` file in the root directory using the `.env.example` file as a template.

### Development

Run the MongoDB database:

```bash
pnpm db:up
```

Run the web app:

```bash
pnpm dev
```

Go to [http://localhost:3000](http://localhost:3000) to view the web app.
Go to [http://localhost:3000/admin](http://localhost:3000/admin) to view the Payload CMS admin panel.

## Database Management

### Local Database Lifecycle

```bash
pnpm db:up
pnpm db:down
```

### Database Backup

Backup a database to `./tmp/backups/dump_<timestamp>.gz`:

```bash
# Using DB_BACKUP_URL environment variable
DB_BACKUP_URL="mongodb://admin:admin@localhost:27017/da-minh-go-vap?authSource=admin" pnpm db:backup

# Or passing the DB URL as an argument
pnpm db:backup "mongodb://admin:admin@localhost:27017/da-minh-go-vap?authSource=admin"
```

The backup dump will be saved as a compressed archive to `./tmp/backups/dump_YYYYMMDD_HHMMSS.gz`.

### Database Restore

Restore a database from a dump archive (drops existing collections in target DB before importing):

```bash
# Restore from the latest dump in ./tmp/backups
DB_RESTORE_URL="mongodb://admin:admin@localhost:27017/da-minh-go-vap?authSource=admin" pnpm db:restore

# Restore from a specific dump file
DB_RESTORE_URL="mongodb://admin:admin@localhost:27017/da-minh-go-vap?authSource=admin" pnpm db:restore ./tmp/backups/dump_20260823_184111.gz

# Or passing destination URL and dump file as arguments
pnpm db:restore "mongodb://admin:admin@localhost:27017/da-minh-go-vap?authSource=admin" ./tmp/backups/dump_20260823_184111.gz
```

> **Prerequisite:** Make sure MongoDB Database Tools (`mongodump` and `mongorestore`) are installed on your machine (`brew install mongodb-database-tools` on macOS).

## PayloadCMS

Whenever you make changes to the PayloadCMS configuration, you need to re-generate the types

```bash
pnpm generate
```

## Production

Create a [.env](.env) file with

```env
MEDIA_PATH=<path/for/media>
```

`MEDIA_PATH` is the path where media files will be stored. It should be a directory other than the project directory to ensure persistence of media files across container restarts. For example, you can use `/srv/www/<domain>/media` with domain replaced with the actual domain name.

Then follows: [https://beease.fr/blog/guide-payload-nextjs-docker-vps]

## Test environment

Create a [.env.test](.env.test) file using the [.env.example](.env.example) file as a template.

Run

```sh
MEDIA_PATH=<path/for/media> docker compose -f docker/test/compose.yml up -d --build
```

Note that `MEDIA_PATH` is relative to the compose file.

Test environment is similar to production without SSL/HTTPS and with isolated db. Test environment is opened on port 3001.
