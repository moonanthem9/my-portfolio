# Content Data

This folder is the content layer for asterism-sys.

Edit `content.js` to add or change:

- `chatbots`: chatbot gallery items
- `notes`: blog-style production notes
- `widgets`: shareable HTML snippets

Later, this file can be replaced by data loaded from an admin page, GitHub-backed Markdown files, Supabase, or another CMS without redesigning the popup screens.

## Admin Drafts

`/admin` provides a writing screen. It sends save/delete requests to `/api/content`, which commits changes to `src/data/userContent.json` through the GitHub Contents API.

For Vercel production, set these environment variables:

- `ADMIN_PASSWORD`: password required by the admin screen.
- `GITHUB_CONTENT_TOKEN`: GitHub fine-grained token with repository Contents read/write permission.
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob read/write token for image uploads.
- `GITHUB_OWNER`: optional, defaults to the connected Vercel repo owner.
- `GITHUB_REPO`: optional, defaults to the connected Vercel repo name.
- `GITHUB_BRANCH`: optional, defaults to `main`.

Uploaded images are sent to Vercel Blob through `/api/upload`. `userContent.json` stores only the public image URL.

Deleting an entry removes its image from Vercel Blob when no remaining entry uses the same URL. Editing an entry preserves its `id` and original note `date`; if an image is replaced, the old image is removed when it is no longer referenced.

## Chatbot Shape

```js
{
  id: 'unique-id',
  name: 'CHATBOT NAME',
  imagePosition: 'center',
  summary: 'Short introduction.',
  platforms: [
    { label: 'Platform Name', href: 'https://example.com' },
  ],
}
```

## Note Shape

```js
{
  id: 'unique-id',
  date: '2026.07.09',
  title: 'Post title',
  body: 'Post body.',
  image: 'optional-data-url-or-image-url',
  tags: ['TAG'],
}
```

## Widget Shape

```js
{
  id: 'unique-id',
  name: 'WIDGET NAME',
  description: 'Short description.',
  html: '<div>{{name}}</div>',
  fields: [
    { key: 'name', label: 'Name', defaultValue: 'ASTERISM' },
  ],
}
```

Widget HTML supports `{{key}}` placeholders. The widget popup renders input controls from `fields`, replaces placeholders in real time, previews the rendered HTML, and copies the rendered HTML.
