# Contributing

Bug reports, ideas and pull requests are welcome. Include the board configuration, seed or saved code, expected behavior, and browser/device details.

```sh
pnpm install
pnpm check
pnpm test:package
pnpm site
```

Game rules stay in pure functions. Every rule change includes a regression test. Player words are supplied in English and Japanese. Public exports have doc comments and the API reference is built from the source. README examples, options, limits and screenshots must match the released package.

The shared `demo/family.css` and `scripts/family-template.mjs` are kept unchanged. Package-specific presentation belongs in its own stylesheet and page builder. Community files match the family copies under `scripts/community/`.

Packages have no runtime dependencies. Node 22 or later is required. Art and sound are original or verified CC0/public-domain works. Record changes in `CHANGELOG.md`; releases use a version tag matching `package.json` and the exported version.

Before release, run the checks, verify a freshly installed tarball, build the site, inspect desktop and phone screenshots, and check every README/API/image link. Follow the [Code of Conduct](CODE_OF_CONDUCT.md) and report security concerns using [SECURITY.md](SECURITY.md).
