# Writing a blog post

The blog is built by GitHub Pages (Jekyll) when you push to `master`. You don't
need to touch any HTML.

## 1. Create the file

Add a Markdown file to `_posts/` named `YYYY-MM-DD-your-post-slug.md`:

```
_posts/2026-12-01-cypress-network-stubbing.md
```

The slug becomes the URL: `https://easabbir.github.io/blog/cypress-network-stubbing/`.

## 2. Front matter

Start the file with this block:

```yaml
---
title: "Stubbing the Network in Cypress Without Lying to Yourself"
description: "One line that appears under the title, on cards and in Google results"
date: 2026-12-01 10:00:00 +0600
category: Test Automation
tags: [cypress, network, flaky-tests]
---
```

- **category** (exactly one) drives the topic filter on `/blog/`. Reuse an
  existing one so posts group together: `Embedded QA`, `Test Automation`,
  `Performance Testing`, `API Testing`, `QA Process`. A new name creates a new
  filter automatically. Add it to `blog_categories` in `_config.yml` to give it
  an icon.
- **tags** are free-form keywords. They are shown on the post and searched by
  the search box.
- **series** + **part** (optional) put the post in an ordered series with
  previous/next links:

  ```yaml
  series: Embedded QA Series
  part: 10
  ```

  For a new series, add its one-line description to `_data/series.yml`.

## 3. Write

Normal Markdown. Use `##` for section headings (the title is already the `#`).
Fenced code blocks get syntax highlighting:

````markdown
```python
def test_echo(log_fetcher):
    ...
```
````

A blockquote renders as a highlighted callout, which is good for a closing takeaway:

```markdown
> **Takeaway:** Test the bytes, not the parsed log.
```

Images: put them in `images/blog/` and reference them as `![Alt text](/images/blog/file.png)`.

If a code sample contains `{{` or `{%`, wrap the post body in
`{% raw %}` … `{% endraw %}` so Jekyll does not try to run it as a template.

## 4. Publish

Commit and push. GitHub Pages rebuilds in about a minute. The post appears on
`/blog/`, on the home page, in `/blog/feed.xml` (RSS) and in `/sitemap.xml`.

Posts dated in the future are not published until that date.

## Preview locally (optional)

Using Docker, from the repo root:

```bash
docker run --rm -it -p 4000:4000 -v "$PWD:/site" -w /site ruby:3.3 \
  bash -c "bundle install && bundle exec jekyll serve --host 0.0.0.0"
```

Then open http://localhost:4000.
