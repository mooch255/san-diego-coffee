const fs = require('fs');
const raw = fs.readFileSync('blog.js', 'utf8').replace(/^﻿/, '');
const window = {};
eval(raw);
const p = window.BLOG_POSTS.find(b => b.id === 'blog_frinj-coffee-california-grown');
p.body.forEach((b, i) => {
  if (b.type === 'image') {
    console.log(i, JSON.stringify(b));
  }
});
