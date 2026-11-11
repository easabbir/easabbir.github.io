# Ehsanul Alam Sabbir — portfolio & blog

Source for [easabbir.github.io](https://easabbir.github.io): a one-page portfolio
plus a Markdown blog, built by GitHub Pages (Jekyll) on every push to `master`.

## What's where

```
index.html            Home page sections (hero, about, experience, projects, skills,
                      recommendations, writing, contact)
_layouts/default.html Page shell used by every page (head, nav, footer, scripts)
_layouts/post.html    Blog article layout
_includes/            head.html, nav.html, footer.html, brand-mark.html, post-card.html
blog/index.html       /blog/ — topic filters, search, series
_posts/               Blog articles (Markdown). See BLOGGING.md
_data/series.yml      One-line descriptions for article series
404.html              "This page didn't pass" error page
styles.css            Design system + home page styles (tokens at the top)
assets/css/blog.css   Blog index + article styles
assets/js/site.js     Theme, mobile menu, scroll effects, copy buttons, contact form
assets/js/blog.js     Blog filters and search
images/               Portrait, logos/ (48px badges), avatars/ (testimonials), og-card.jpg
_config.yml           Site settings: resume link, contact email, SEO, blog categories
```

## Common edits

- **Resume:** replace `Ehsanul Alam Sabbir.pdf`, then in `_config.yml` bump the `?v=` date
  in `resume_url` and update `resume_updated`. Every resume button uses that setting.
- **Contact form recipient:** `contact_email` in `_config.yml`. The form has no server: it
  opens the visitor's email app with the message filled in, so nothing is lost silently.
- **Brand colour:** `--accent` near the top of `styles.css` (one value for light mode, one
  for dark mode). Everything else follows.
- **New blog post:** add a Markdown file to `_posts/` — see [BLOGGING.md](BLOGGING.md).
- **Social preview image:** `images/og-card.jpg` (1200×630), used when links are shared.

## Preview locally

GitHub Pages builds the site for you; to preview first, from the repo root:

```bash
docker run --rm -it -p 4000:4000 -v "$PWD:/site" -w /site ruby:3.3 \
  bash -c "bundle install && bundle exec jekyll serve --host 0.0.0.0"
```

Then open http://localhost:4000. (Opening `index.html` directly won't work: Jekyll has to
fill in the shared header, footer and blog list.)

## Built with

Jekyll on GitHub Pages, plain CSS and JavaScript (no frameworks), Geist and Geist Mono
from Google Fonts, Font Awesome icons. Light and dark themes follow the visitor's system
setting until they pick one. Animations are switched off for visitors who ask for reduced
motion.
