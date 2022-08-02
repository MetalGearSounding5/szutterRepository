# Szutter guarantee
*best project in this side of galaxy*

### Development

#### Installing node
To start development you need to have `node` installed,<br>
we recommend installing node by making use of `nvm`, to install `nvm` use the following bash script: <br><br>
`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash`

To install `node`, use `nvm` as follows: `nvm i 18`

#### Installing dependencies

Run `npm ci`

#### Running project for local development

Run `npm start` or use bundled IDEA project configuration called `Serve`.
This will automatically open browser at http://localhost:10001 and will refresh it on javascript files changes.

#### Building project for production

Run `npm run build` or use bundled IDEA project configuration called `Build`.
This will build minified version of project and output to the `build` directory, that is placed alongside `src`.
