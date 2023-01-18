# Pull Request Size Labelling Probot

> A GitHub Action built with [Probot](https://github.com/probot/probot) for adding size labels to PRs

![image](https://user-images.githubusercontent.com/15612025/211660283-0bdc2226-9628-4237-a718-772cbc44ace6.png)


## Usage via GitHub Actions

```
name: "Pull Request Size Labelling"
on:
  pull_request:
    types:
      - opened
      - reopened
      - synchronize
jobs:
  addLabels:
    runs-on: ubuntu-latest
    steps:
      - uses: JoshwJB/pull-request-size-labelling-probot@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Overriding the default config

Add a new file under `.github/pullRequestSizing.yml` and add the config below to it, updating any values you wish to change.

You can use the labels section to enable/disable the lines changed and files changed labelling independantly.

```
labels:
    lines: true
    files: true

lines:
    sizing:
        xxl: 1000
        xl: 500
        l: 250
        m: 100
        s: 20
    colours:
        xxl: "#25066C"
        xl: "#3709A1"
        l: "#4A0CD6"
        m: "#8B5CF6"
        s: "#C2A9FA"
        xs: "#DED0FC"
    prefix: "lines/"

files:
    sizing:
        xxl: 60
        xl: 40
        l: 25
        m: 10
        s: 5
    colours:
        xxl: "#542E03"
        xl: "#854E05"
        l: "#E79609"
        m: "#F8C345"
        s: "#FADB76"
        xs: "#FBE58E"
    prefix: "files/"
```

## License

[ISC](LICENSE) © 2022 Joshua William John Barber
