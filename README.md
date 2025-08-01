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
yarn generate
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
docker compose up mongo -d
```

Run the web app:

```bash
yarn dev
```

Go to [http://localhost:3000](http://localhost:3000) to view the web app.
Go to [http://localhost:3000/admin](http://localhost:3000/admin) to view the Payload CMS admin panel.

## PayloadCMS

Whenever you make changes to the PayloadCMS configuration, you need to re-generate the types

```bash
yarn generate
```

## Production

Create a [.env](.env) file with

```env
MEDIA_PATH=<path/for/media>
```

`MEDIA_PATH` is the path where media files will be stored. It should be a directory other than the project directory to ensure persistence of media files across container restarts. For example, you can use `/srv/www/<domain>/media` with domain replaced with the actual domain name.

Then follows: [https://beease.fr/blog/guide-payload-nextjs-docker-vps]
