# Mango Tango

Mango Tango is a minimal front-end boilerplate that gets you set up with [Parcel](https://parceljs.org) as fast as possible.

## Getting started

Clone the repository.

```
git clone git@github.com:evan-goode/mango-tango.git # SSH
git clone https://github.com/evan-goode/mango-tango.git # HTTPS

cd mango-tango
```

Unless you're working on the boilerplate itself, you'll want to remove the existing .git directory.

```
rm -rf .git
```

Install dependencies and start the development server.

```
yarn
yarn start
```

The default entry point is `source/index.html`. Remember to set the page title in `source/index.html`, fill out `source/manifest.json`, and replace `source/images/icon.png` with your own.

## Building for production

```
yarn build
```

## See also

- [Parcel](https://parceljs.org)
- [Yarn](https://yarnpkg.com)
- [Babel](https://babeljs.io)
