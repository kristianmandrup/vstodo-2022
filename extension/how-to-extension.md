# vstodo

Code for [How to code a VS Code extension](https://www.youtube.com/watch?v=a5DX5pQ9p5M&t)

For a guide on how publish extension, see [How To Create And Deploy A VSCode Extension](https://youtu.be/q5V4T3o3CXE?t=1082)

# Apps

- [API](api/Readme.md)
- [Extension](extension/Readme.md)

## Architecture

- Extension
- API

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

## Extension

The extension when published will display the `Readme` file at the root as the documentation for the plugin.

### Extension activation

When the extension is first activated the `activate(context: vscode.ExtensionContext)` function of `extension.ts` is called.

### Add status bar items

Note: `$(beaker)` displays a `beaker` icon (see [vscode-codicons](https://microsoft.github.io/vscode-codicons/dist/codicon.html))

```ts
const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
item.text = "$(beaker) Add Todo";
item.command = "vstodo.addTodo";
item.show();
```
