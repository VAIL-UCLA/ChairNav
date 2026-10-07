# ChairNav

Project website for **ChairNav: Cross-Embodiment Pretraining and Personalization for Long-Horizon Wheelchair Navigation**.

Junhua Huang*, Zhizheng Liu*, Honglin He, Xiang Zhang, and Bolei Zhou. *Equal contribution.

## Website

**[Visit the ChairNav project website](https://vail.cs.ucla.edu/ChairNav/)**

`site/` is a self-contained static website with local media and fonts. It requires no backend, API keys, external drive, or build dependencies.

To preview locally:

```sh
python3 -m http.server 8000 --directory site
```

Open http://localhost:8000/.

## Publishing

In this repository, select **Settings → Pages → Build and deployment → Source → GitHub Actions**. The included `Publish ChairNav` workflow publishes only `site/` on pushes to `main`, or when manually run. Use the final URL shown in Pages as the lab's publication website link.

The lab homepage can link directly to this project; this site does not use the lab's Jekyll theme. Citation remains a placeholder until the arXiv identifier is available. Canonical URL, sharing metadata, and sitemap use https://vail.cs.ucla.edu/ChairNav/.

## Reusable design skill

`skills/research-demo-showcase/` contains a reusable Codex skill documenting the design and interaction principles. It is kept alongside the website and is not included in the published Pages artifact.

## Credits

Typography and layout adapted from [Nerfies](https://nerfies.github.io/), under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Retain template and bundled font notices. These licenses do not grant rights to the research media, paper figures, lab branding, or third-party material. No analytics are included.
