# Shankar Ravi — Portfolio

Static rebuild of https://rvishankarrvi.wixsite.com/my-site for GitHub Pages.

## Structure

```
index.html                    Home
ar-vr-projects.html           AR/VR Projects
education-projects.html       Education Projects
technology-and-society.html   Technology and Society
assets/css/style.css          All styles (colors/fonts as CSS variables at the top)
assets/images/                All images, logos and the footer SVG
```

No build step: edit the HTML files directly. The header and footer are repeated in each page, so update all four when changing them.

## Publish

Push to `main`, then in the repo go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`. The site will be at https://shankar-r19.github.io/portfolio/.
