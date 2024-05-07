# AntiSpam-action

![](spam-github-issues.png)

# Docs

- [**See examples!**](https://github.com/juancarlospaco/antispam-action/raw/nim/antispam-example.mp4)

# Use

```yaml
name: "AntiSpam"
on:
  issues:
    types: opened
jobs:
  antispam:
    name: AntiSpam
    runs-on: ubuntu-latest
    permissions:
      issues: write
    steps:
      - uses: actions/checkout@v3
      - uses: juancarlospaco/antispam-action@nim
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```
