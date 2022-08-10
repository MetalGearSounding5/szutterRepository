# Szutter guarantee
*best project in this side of galaxy*

### Development

#### Installing node and pnpm
To start development you need to have `node` installed,<br>
we recommend installing node by making use of `nvm`, to install `nvm` use the following bash script: <br><br>
`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash`

To install `node`, use `nvm` as follows: `nvm i 18`

To install `pnpm`, run `npm i -g pnpm`

#### Installing dependencies

Run `pnpm i`

#### Running project for local development

Run `pnpm run start` or use bundled IDEA project configuration called `Serve`.
This will automatically open browser at http://localhost:10001 and will refresh it on javascript files changes.

#### Building project for production

Run `pnpm run build` or use bundled IDEA project configuration called `Build`.
This will build minified version of project and output to the `build` directory, that is placed alongside `src`.

#### webGPU

To use webGPU use either [ChromeDev](https://www.google.com/chrome/dev/) or [Chrome Canary](https://www.google.com/chrome/canary/). Go to `chrome://flags/#enable-unsafe-webgpu` and enable this flag. When running ChromeDev on linux make sure to run it with additional flag `--enable-features=Vulkan`.
