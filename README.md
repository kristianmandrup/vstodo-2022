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

This project is setup to use [typeorm](https://typeorm.io/) as the ORM.

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

The project [express](https://expressjs.com/) API server with [passport](https://www.passportjs.org/) and [passport-github](https://github.com/jaredhanson/passport-github) as middleware auth strategy

```js
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:3002/auth/github/callback",
    },
    async (_, __, profile, cb) => {
      // find user in database if already exists
      let user = await User.findOne({ where: { githubId: profile.id } });
      if (user) {
        // // if user already in db, update name and save
        user.name = profile.displayName;
        await user.save();
      } else {
        // if user not already in db, create user in db
        user = await User.create({
          name: profile.displayName,
          githubId: profile.id,
        }).save();
      }
      // call the completion cb function with the JWT signed access token
      cb(null, {
        accessToken: jwt.sign(
          { userId: user.id },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "1y",
          }
        ),
      });
    }
  )
);

app.get("/auth/github", passport.authenticate("github", { session: false }));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { session: false }),
  (req: any, res) => {
    // redirect to extension server auth endpoint with access token of logged in user
    res.redirect(`http://localhost:54321/auth/${req.user.accessToken}`);
  }
);
```

Store the github secrets in a `.env` file

```txt
GITHUB_CLIENT_SECRET=
GITHUB_CLIENT_ID=
ACCESS_TOKEN_SECRET=
```

Go to [http://localhost:3002/auth/github](http://localhost:3002/auth/github) in the browser to test that github auth works ([1:58 hrs](https://youtu.be/a5DX5pQ9p5M?t=7100) into the video)

The vcode extension server can be found in `extension/src/authenticate.ts`

```ts
export const authenticate = (fn?: () => void) => {
  const app = polka();

  // ... listen to port 54321
  app.listen(54321, (err: Error) => {
    if (err) {
      vscode.window.showErrorMessage(err.message);
    } else {
      // login via github auth
      vscode.commands.executeCommand(
        "vscode.open",
        vscode.Uri.parse(`${apiBaseUrl}/auth/github`)
      );
    }
  });
};
```

Note that `apiBaseUrl` can be found in constants.

```ts
export const apiBaseUrl = "http://localhost:3002";
```

This value can be loaded as an `ENV` variable for local vs production env

```ts
export const _prod_ = process.env.NODE_ENV === "production";
export const apiBaseUrl = _prod_
  ? process.env.API_BASE_URL
  : "http://localhost:3002";
```

### Display user in Svelte view

The `/me` route in the API can be used to fetch the user from the DB if the user has been logged in (bearer token present in `authorization` header on the request)

```ts
app.get("/me", async (req, res) => {
  // Bearer ....
  const authHeader = req.headers.authorization;
  // ...
  try {
    const payload: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    userId = payload.userId;
  } catch (err) {
    res.send({ user: null });
    return;
  }
  // fetch user from DB
  const user = await User.findOne({ where: { id: parseInt(userId) } });
  // send user in response
  res.send({ user });
});
```

Svelte listening for token and fetching user and displaying

```ts
window.addEventListener("message", async (event) => {
  const message = event.data;
  switch (message.type) {
    // receive the token from vscode extension (from TokenManager)
    case "token":
      accessToken = message.value;
      // call API route /me with the OAuth bearer auth header
      const response = await fetch(`${apiBaseUrl}/me`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      // get the user from response
      user = data.user;
      loading = false;
  }
});
// ask vscode extension for an auth token
tsvscode.postMessage({ type: "get-token", value: undefined });
```

The full extension Webview authentication listener setup

```ts
webviewView.webview.onDidReceiveMessage(async (data) => {
  switch (data.type) {
    case "logout": {
      TokenManager.setToken("");
      break;
    }
    case "authenticate": {
      authenticate(() => {
        webviewView.webview.postMessage({
          type: "token",
          value: TokenManager.getToken(),
        });
      });
      break;
    }
    case "get-token": {
      webviewView.webview.postMessage({
        type: "token",
        value: TokenManager.getToken(),
      });
      break;
    }
  }
});
```

### Svelte auth display

- Display when user available.
- Display either `login` or `logout` button depending on login status

```svelte
// ... display when user available

{#if loading}
  <div>loading...</div>
{:else if user}
  ....
  <button
    on:click={() => {
      accessToken = "";
      user = null;
      _tsvscode.postMessage({ type: "logout", value: undefined });
    }}>logout</button
  >
{:else}
  <button
    on:click={() => {
      _tsvscode.postMessage({ type: "authenticate", value: undefined });
    }}>login with GitHub</button
  >
{/if}
```

## Testing auth

Use the registered command `authenticate` for testing authentication.

`package.json`

```json
"onCommand:vstodo.authenticate",
{
    "command": "vstodo.authenticate",
    "category": "VSTodo",
    "title": "Authenticate"
}
```

`extension.ts`

```ts
context.subscriptions.push(
  vscode.commands.registerCommand("vstodo.authenticate", () => {
    try {
      authenticate();
    } catch (err) {
      console.log(err);
    }
  })
);
```

### Install dependencies

Use package of choice such as `npm` or `yarn`

```bash
cd api
yarn
```

```bash
cd extension
yarn
```

## Watch and compile

Go to the `root` folder and run the `watch` script

```bash
yarn run watch
```

This should concurrently run watch for each package.
Alternatively run watch on each individual package

```bash
cd extension
yarn run watch
```

```bash
cd api
yarn run watch
```

## Run api

Go to the `api` folder

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

## Run extension

Run `yarn watch` to ensure you build on every code change.

- Go to `dist/extension.js`
- Press `F5` (`Fn` + `F5` on Mac) or go to the `Run` menu and click `Start debugging`
- Select `VS Code extension` in the drop down menu
- In the side panel, go to the bottom and select `VSTodo`

You should see `VSTodo` window and `loading...`

Use Cmd-R to reload

## Configuration

In `package.json`

```json
  "activationEvents": [
    "onCommand:vstodo.helloWorld",
    "onCommand:vstodo.askQuestion",
    "onCommand:vstodo.refresh",
    "onCommand:vstodo.addTodo",
    "onCommand:vstodo.authenticate",
    "onView:vstodo-sidebar"
  ],
  "main": "./dist/extension.js",
  "contributes": {
    "viewsContainers": {
      "activitybar": [
        {
          "id": "vstodo-sidebar-view",
          "title": "VSTodo",
          "icon": "media/checklist.svg"
        }
      ]
    },
    "views": {
      "vstodo-sidebar-view": [
        {
          "type": "webview",
          "id": "vstodo-sidebar",
          "name": "VSTodo",
          "icon": "media/checklist.svg",
          "contextualTitle": "VSTodo"
        }
      ]
    },
    "commands": [
      {
        "command": "vstodo.helloWorld",
        "title": "Hello World"
      },
      {
        "command": "vstodo.askQuestion",
        "category": "VSTodo",
        "title": "Ask Question"
      },
      {
        "command": "vstodo.refresh",
        "category": "VSTodo",
        "title": "Refresh"
      },
      {
        "command": "vstodo.addTodo",
        "category": "VSTodo",
        "title": "Add Todo From Selection"
      },
      {
        "command": "vstodo.authenticate",
        "category": "VSTodo",
        "title": "Authenticate"
      }
    ]
```

## Interacting with code files

See [Add Editor Commands](https://code.visualstudio.com/api/extension-guides/virtual-documents#add-editor-commands) in the VS Code docs

```ts
const sayBackwards = async () => {
  if (!vscode.window.activeTextEditor) {
    return; // no editor
  }
  // get the document of the active editor
  let { document } = vscode.window.activeTextEditor || {};
  if (!document) {
    return;
  }
  // get the text of the document
  const text = document.getText();
  // ...
};

// register command
const regCommand = vscode.commands.registerCommand(
  "cowsay.backwards",
  sayBackwards
);
// add command to subscriptions
subscriptions.push(command);
```

## Webview

Use `acquireVsCodeApi` to fetch a special VS Code API object to interact with VS Code from the webview (See `SidebarProvider`).

```js
const tsvscode = acquireVsCodeApi();
```

### Communicating from Webview to extension

Use the `tsvscode` object in the webview to communicate to the extension.

#### Post a message

```ts
tsvscode.postMessage({ type: "get-token", value: undefined });
```

Listen to messages using `webviewView.webview.onDidReceiveMessage` in the extension (see `SidebarProvider`)

```ts
webviewView.webview.onDidReceiveMessage(async (data) => {
  switch (data.type) {
    // ...
    case "onInfo": {
      if (!data.value) {
        return;
      }
      vscode.window.showInformationMessage(data.value);
      break;
    }
    // ...
  }
});
```

#### Set state

```ts
tsvscode.setState({ page });
```

### Communicate from extension to Webview

Use the `webview.postMessage` to send a message

```ts
sidebarProvider._view?.webview.postMessage({
  type: "new-todo",
  value: text,
});
```

In the webview, set up an event listener

```ts
  onMount(async () => {
    window.addEventListener("message", async (event) => {
      const message = event.data;
      switch (message.type) {
        case "new-todo":
          addTodo(message.value);
          break;
      }
    });
```

The full solution could look sth like this

```ts
vscode.commands.registerCommand("vstodo.addTodo", () => {
  const text = getActiveText();
  if (!text) {
    return;
  }

  sidebarProvider._view?.webview.postMessage({
    type: "new-todo",
    value: text,
  });
});
```

### Add status bar items

Note: `$(beaker)` displays a `beaker` icon (see [vscode-codicons](https://microsoft.github.io/vscode-codicons/dist/codicon.html))

```ts
const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
item.text = "$(beaker) Add Todo";
item.command = "vstodo.addTodo";
item.show();
```
