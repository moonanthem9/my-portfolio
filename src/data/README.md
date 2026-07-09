# Content Data

This folder is the temporary content layer for the portfolio.

Edit `content.js` to add or change:

- `chatbots`: chatbot gallery items
- `notes`: blog-style production notes
- `widgets`: shareable HTML snippets

Later, this file can be replaced by data loaded from an admin page, GitHub-backed Markdown files, Supabase, or another CMS without redesigning the popup screens.

## Admin Drafts

`/admin` provides a first writing screen. It currently saves new entries to browser `localStorage` through `contentStore.js`, then merges those entries with `content.js`.

This is useful for testing the authoring flow before adding a real backend. To make entries public across devices, replace the storage functions in `contentStore.js` with a GitHub API, Supabase, Vercel Blob, or CMS-backed save/load layer.

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
  html: '<div>Shareable HTML</div>',
}
```
