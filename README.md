# Pull Request Size Labelling Probot

> A GitHub App built with [Probot](https://github.com/probot/probot) for adding size labels to PRs

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
    xxl: 1000
    xl: 500
    l: 250
    m: 100
    s: 20

files:
    xxl: 60
    xl: 40
    l: 25
    m: 10
    s: 5
```

## Setup

```sh
# Install dependencies
npm install

# Build the bot
npm run build

# Run the bot
npm run start
```

## Docker

```sh
# 1. Build container
docker build -t pr-size-bot .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> pr-size-bot
```

## Contributing

If you have suggestions for how pr-size-bot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2022 Joshua William John Barber
