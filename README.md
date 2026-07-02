# PDF to image downloader

Fetches a PDF from a URL, renders each page to PNG, and returns a single image or a ZIP of multiple pages.

## Stack

- Static UI in `public/`
- Serverless API at `/api/download-pdf-to-jpg` (Node.js, up to 60s on Vercel Pro)

## Local development

Install the [Vercel CLI](https://vercel.com/docs/cli), then:

```bash
npm install
npm run dev
```

Open the URL shown by `vercel dev` (typically `http://localhost:3000`).

## Deploy

Connect this repository to [Vercel](https://vercel.com) or deploy with:

```bash
vercel
```

PDF conversion needs the **Node.js** runtime (not Edge). The function uses `maxDuration: 60`; on the Hobby plan the limit is lower—use Pro or reduce PDF size/page count if you hit timeouts.

## API

`GET /api/download-pdf-to-jpg`

| Query param     | Required | Description                                      |
|-----------------|----------|--------------------------------------------------|
| `download_link` | yes      | Public URL of the PDF to fetch                   |
| `filename`      | no       | Base name for the output file (default: `image`) |

- One page: `Content-Type: image/png`, filename `{filename}.png`
- Multiple pages: `application/zip`, filename `{filename}.zip`

## Tests

```bash
npm test
```
