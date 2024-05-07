# AntiSpam-action

![](spam-github-issues.png "Github Issues Spam")


# Docs

https://github.com/juancarlospaco/antispam-action/assets/1189414/04effebc-1cbc-4360-a43d-6cf46831c0de


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


# Stars

![](https://starchart.cc/juancarlospaco/antispam-action.svg)
