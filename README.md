# plugin-allowlist

Allowlist engine plugin for DDN.

Hasura DDN allows you to add engine plugins to the supergraph ([docs](https://hasura.io/docs/3.0/plugins/overview/)).
Engine plugins are used to extend the functionality of the DDN supergraph. This plugin is used to allowlist the requests
to the DDN supergraph.

**Note**: This plugin should be used as a pre-parse plugin.

## How it works

The plugin starts up a server that listens for incoming requests. It checks if the incoming graphql query is allowed
based on the allowlist configuration. If the query is allowed, it indicates the same to the DDN engine. If the query is
not allowed, it returns an error response (visible to the end user).

## Configuration

The plugin can be configured using the config.ts file. The configuration includes the following:

- `headers.hasura-m-auth`: The secret token that is used to authenticate the incoming requests.
- `allowlist`: The list of queries that are allowed to be executed.
- `allowedRoles`: The roles that are allowed to execute all queries.

## Development

**Note**: We are using Cloudflare wrangler for local development and deployment. However, you can use any other tool
for the same. You will have to modify the files accordingly.

The plugin is written in TypeScript. The source code is present in the `src` directory. The core logic for the allowlist
plugin is present in the `src/allowlist.ts` file.

### Local development

To run the plugin locally, you can use the following steps:

- Install wrangler:

  ```sh
  npm install -g wrangler
  ```

- Generate project files:

  ```sh
  wrangler generate allowlist-plugin https://github.com/hasura/engine-plugin-allowlist
  ```

- Install:

  ```sh
  cd allowlist-plugin && npm i
  ```

- For starting up the local development server:

  ```sh
  npm start
  ```

The above command will start a local server that listens for incoming requests. The server runs on port 8787 by default.
The URL of the local server will be displayed in the terminal.

### Cloud deployment

For cloud deployment, you can use the following steps in addition to the local development steps:

- Create an account on cloudflare.

- Login:

  ```sh
  wrangler login
  ```

- For cloud deployment:
  ```sh
  npm run deploy
  ```

The above command should deploy the allowlist-plugin (as a lambda) using Cloudflare workers. The URL of the deployed
plugin will be displayed in the terminal.

## Using the plugin in DDN

Update the metadata to add the plugin-related config (in global subgraph). Also,
add the env vars for the URL of local dev and cloud deployment:

```yaml
kind: LifecyclePluginHook
version: v1
definition:
  name: cloudflare allow list
  url:
    valueFromEnv: ALLOW_LIST_URL
  pre: parse
  config:
    request:
      headers:
        additional:
          hasura-m-auth:
            value: <your-secret-token>
          forward:
            - my-header
      session: {}
      rawRequest:
        query: {}
        variables: {}
```

Build DDN supergraph:

```sh
ddn supergraph build create
```

**Note**: For end-to-end tracing, you would have to update the `wrangler.toml` file to add the Hasura PAT in
`OTEL_EXPORTER_PAT` var.
