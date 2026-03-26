# Gamingroom Admin Dashboard

This is the admin dashboard where your librarians will be assigning kids their gamingroom slots.

<img width="1916" height="919" alt="gamingroom-admin" src="https://github.com/user-attachments/assets/ba2d954e-c5d8-4c79-ba17-fcee33460124" />

## Dependencies

This app doesn't really make sense without first installing [gamingroom-API](https://github.com/Ornendil/gamingroom-API). The dashboard fetches tenant settings and session data from that API.

Afterwards, you'll probably also want to install [gamingroom-display](https://github.com/Ornendil/gamingroom-display)


## Install

1. Set your settings in `src/data.js`. You'll want to edit `aapningstider` and `computers`. I can't recall if setting `timeSlotSize`to anything but 15 works, but you can try.

2. I don't think there's anything more you have to edit, but I'm probably wrong.

3. Build the app. Instructions for this are below.

4. Put the contents of the `dist` folder in the `public` folder you created on your server when installing the [Gamingroom-API](https://github.com/Ornendil/gamingroom-API).

## Configuration

The frontend reads its API base URL from `VITE_API_BASE_URL`.

Create a local `.env.local` file when needed:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

Optional local HTTPS for the Vite dev server can also live in `.env.local`:

```dotenv
DEV_HTTPS_KEY=./localhost+2-key.pem
DEV_HTTPS_CERT=./localhost+2.pem
```

If those certificate paths are missing, the dev server falls back to plain HTTP automatically.

## Scripts

In the project directory, you can run:

### `npm run dev`

Starts the Vite dev server on port `3000`.

### `npm run build`

Builds the app into the `dist/` folder.

### `npm run preview`

Serves the production build locally for a final check.

## Deployment

This app is built with a Vite base path of `/admin/`.

1. Run `npm run build`.
2. Deploy the contents of `dist/` where your API serves the admin frontend from `/admin/`.
3. Keep the static assets from `public/` alongside the built output so the manifest, icons, logos, and `robots.txt` are available.
