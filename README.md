# OmniTextFix

Static web app for some common text and code cleanup functions.

## Run locally

Serve the folder with any static server, for example:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy to GitHub Pages

Push the contents of this directory to a repository, then choose **Settings → Pages → Deploy from a branch** and select the branch and `/ (root)` folder. The app uses relative asset paths, so it also works when hosted under a repository subpath.

Prism.js is loaded from jsDelivr for syntax highlighting. The utilities themselves run entirely in the browser; no input is sent to a server.
