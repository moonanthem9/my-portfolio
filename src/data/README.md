# Content Data

This folder is the temporary content layer for the portfolio.

Edit `content.js` to add or change:

- `chatbots`: chatbot gallery items
- `notes`: blog-style production notes
- `widgets`: shareable HTML snippets

Later, this file can be replaced by data loaded from an admin page, GitHub-backed Markdown files, Supabase, or another CMS without redesigning the popup screens.

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
