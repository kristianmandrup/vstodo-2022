# Todo API

- `watch` watch files and compile with tsc (typescript compiler)
- `dev` - Start dev server via nodemon

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
