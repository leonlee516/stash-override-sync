# Stash Override Sync

This repo generates a Stash override from:

https://raw.githubusercontent.com/mihomo-party-org/override-hub/main/yaml/%E5%B8%83%E4%B8%81%E7%8B%97%E7%9A%84%E8%AE%A2%E9%98%85%E8%BD%AC%E6%8D%A2.yaml

The generated file adds `#!replace` to:

- `rule-providers`
- `proxy-groups`
- `rules`

Use this URL in Stash after replacing `YOUR_GITHUB_USERNAME` and `YOUR_REPO_NAME`:

```text
https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/main/dist/buding-subscription-convert.stoverride
```

Or use Stash one-click import:

```text
https://link.stash.ws/install-override/raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/main/dist/buding-subscription-convert.stoverride
```

The GitHub Action runs every 6 hours and can also be run manually from the Actions tab.
