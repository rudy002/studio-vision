# Studio Vision

**Multilingual real estate photography platform** — built for a real client to showcase property photography, manage media, and capture leads, with a fully internationalized interface and an interactive coverage map.

🔗 **Live:** [studio-vision-pied.vercel.app](https://studio-vision-pied.vercel.app/en)

<!-- Add a screenshot or short GIF here for instant impact:
![Studio Vision preview](./public/preview.png)
-->

---

## Features

- 🌍 **Multilingual (i18n)** — full interface translation via `next-intl`, locale-aware routing.
- 🗺️ **Interactive coverage map** — Leaflet + react-leaflet with merged Israeli region borders (Turf.js union) to display service areas.
- 🖼️ **Media management** — image upload and delivery through **Cloudflare R2** (S3-compatible) using the AWS SDK with pre-signed URLs.
- 🔐 **Authentication** — protected admin area via NextAuth.
- 📊 **Admin dashboard** — manage portfolio content and incoming requests.
- ✉️ **Automated contact emails** — transactional emails handled with Resend.
- ✨ **Polished UI** — Tailwind CSS 4 and Framer Motion animations.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4, Framer Motion, lucide-react |
| Auth | NextAuth |
| Database | Supabase |
| Storage | Cloudflare R2 via AWS SDK (S3 client + presigner) |
| Maps | Leaflet, react-leaflet, Turf.js |
| i18n | next-intl |
| Email | Resend |
| Deployment | Vercel |

## Getting Started

```bash
# install dependencies
npm install

# run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment variables

Create a `.env.local` file with the following keys:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Cloudflare R2 (S3-compatible)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# Resend
RESEND_API_KEY=
```

### Useful scripts

```bash
npm run dev            # start dev server (port 3000)
npm run build          # production build
npm run start          # run production build
npm run fetch-borders  # fetch & generate Israel GeoJSON region borders
```

## License

This project was built for a real client. Code is shared for portfolio and reference purposes.
