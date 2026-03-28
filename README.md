![psysuite banner](assets/banner.png)

<div align="center">
<h1>psysuite</h1>
<p>A collection of beautiful, free and open source, secure and private apps</p>
</div>

<br />

## Getting Started

### Requirements

- [bun](https://bun.sh/)

### Setup

1. Set up your environment

Follow the expo [guide](https://docs.expo.dev/get-started/set-up-your-environment/?platform=ios&device=simulated&mode=development-build).

Make sure development build is selected.

2. Install dependencies

```bash
bun install
```

### Run

Navigate into one of the apps and run

```bash
bun ios --device

bun android --device
```

### Lint & format

We use [ultracite](http://ultracite.ai/) with [oxlint](https://oxc.rs/docs/guide/usage/linter) and [oxfmt](https://oxc.rs/docs/guide/usage/formatter).

To check for problems, run the following:

```bash
bun check
```

To try to fix them automatically, run:

```bash
bun fix
```

## License

Released under the **MIT** license.
