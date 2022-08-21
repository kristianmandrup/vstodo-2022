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

## Pages

Pages are controlled via the `page` variable in `Sidebar.svelte`.
The state of which page is selected is stored in VS Code state manager, via the
`getState()` and `setState(state)` methods.

```svelte
let page: "todos" | "contact" = tsvscode.getState()?.page || "todos";
$: {
  tsvscode.setState({ page });
}
```
