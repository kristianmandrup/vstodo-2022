# vstodo

code for [How to code a VS Code extension](https://www.youtube.com/watch?v=a5DX5pQ9p5M&t)

# Apps

- [API](api/Readme.md)
- [Extension](extension/Readme.md)

## Architecture

- Extension
- API

### Extension architecture

The main extension source files can be found in `extension/src`

- `SidebarProvider` is a `vscode.WebviewViewProvider` which manages the `Sidebar` webview.

### API architecture

The main extension source files can be found in `extension/src`

- `SidebarProvider` is a `vscode.WebviewViewProvider` which manages the `Sidebar` webview.
- `getNonce` is a function to generate unique identifier
- `constants` contains global extension constants such as `apiBaseUrl`

## Installation

### Install Postgres Database

[Download Postgres Database](https://www.postgresql.org/download/) locally and run installer.

On Mac the best and easiest way is to [use Homebrew postgresql](https://formulae.brew.sh/formula/postgresql) recipe

`brew install postgresql`

[Create a database](https://www.postgresql.org/docs/current/manage-ag-createdb.html) named `vstodo`

```bash
createdb vstodo
```

### Troubleshooting

If you installed via homebrew after using the download/installer:

[Uninstall Postgres from installer on Mac](https://www.enterprisedb.com/docs/supported-open-source/postgresql/installer/05_uninstalling_postgresql/#uninstalling-postgresql-on-mac)

Go to the Postgres Library for the version installed `cd /Library/PostgreSQL/`

Run the uninstaller

`/Library/PostgreSQL/14 $ open uninstall-postgresql.app`

Open a fresh new CLI session

## Setup Github OAuth app

Go to [Github -> Settings -> Developers](github.com/settings/developers) and click on `Create new OAuth app`. Fill in the form:

- App name: `VSTodo`
- Homepage URL: `localhost:3002`
- Callback URI: `http://localhost:3002/auth/github/callback`

For Prod, create a new OAuth app with Prod settings (not using `localhost`)

### Install dependencies

```bash
cd api
npm i
```

```bash
cd extension
npm i
```

## Watch and compile

```bash
cd api
npm run watch
```

```bash
cd extension
npm run watch
```

## Run api

```bash
$ cd api
$ npm run dev
> vstodo-api@1.0.0 dev
> nodemon dist/index.js

[nodemon] 2.0.16
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node dist/index.js`
listening on localhost:3002
```
