# Da Minh Go Vap

## Getting Started

Generate PayloadCMS secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Generate typescript types:

```bash
yarn generate:types
```

Run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## PayloadCMS

Whenever you make changes to the PayloadCMS configuration, you need to re-generate the types

```bash
yarn generate
```
