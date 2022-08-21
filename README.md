# vstodo extension

Code for [How to code a VS Code extension](https://www.youtube.com/watch?v=a5DX5pQ9p5M&t)

## Publishing

Install `vsce`

```bash
$ npm i vsce -g
$ vsce --help
```

Package extension for publishing

```bash
$ cd myExtension
$ vsce package
```

The publishing tool checks the following constraints:

- The `icon` provided in `package.json` may not be an SVG.
- The `badges` provided in the `package.json` may not be SVGs unless they are from trusted badge providers.
- Image URLs in `README.md` and `CHANGELOG.md` need to resolve to https URLs.
- Images in `README.md` and `CHANGELOG.md` may not be SVGs unless they are from trusted badge providers.

### Create Azure Devops org

Go to [Azure Devops - Create an organization](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/create-organization?view=azure-devops#create-an-organization) and follow the instructions.

You will also need to have (or create) a user account.

For your organization, click `Profile -> Personal Access Tokens`. Then click `New token`.
In the create token form:

- select `All accessible organisations` for the `Organization` entry
- under `Marketplace`, select `Manage`

Click `Create` to create the token and copy it to clipboard.

## Create a publisher

Every extension needs to include a publisher name in its `package.json` file.

You can create a new publisher through the [Visual Studio Marketplace publisher management page](https://marketplace.visualstudio.com/manage). You need to login in with the same Microsoft account you used to create the _Personal Access Token_

On the Management page click `Create Publisher` and fill in the Publisher form.
When the publisher has been created, copy the ID.

You can then login from the CLI

`$ vsce login <publisher id>`

Add a `"publisher": "<publisher id>"` entry to your `package.json` file

Now you can publish

`$ vsce publish` (will ask for your token)

Alternatively you can publish like this

`$ vsce publish -p <token>`

## Versioning

Publish and increment minor version

`$ vsce publish minor`

Publish as specific semver version

`$ vsce publish 2.0.1`

## Pre-release

```bash
$ vsce package --pre-release
$ vsce publish --pre-release
```

## Unpublish

`$ vsce unpublish (publisher id).(extension name)`

## Bundle extension

See [bundling extension](https://code.visualstudio.com/api/working-with-extensions/bundling-extension)

## Testing

See [helloworld-test-sample](https://github.com/microsoft/vscode-extension-samples/tree/main/helloworld-test-sample)

## Continuous Integration

See [continuous integration](https://code.visualstudio.com/api/working-with-extensions/continuous-integration)
