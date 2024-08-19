# plugin-allowlist
Allowlist engine plugin for v3

Deploy the allowlist-plugin (as a lambda) using Cloudflare workers :

- Create an account on cloudflare.

- Install wrangler:
  ```sh
  npm install -g wrangler
  ```

- Login:
  ```sh
  wrangler login
  ```

- Generate project files:
  ```sh
  wrangler generate allowlist-plugin https://github.com/paritosh-08/allowlist-plugin-template
  ```

- Install:
  ```sh
  cd allowlist-plugin && npm i
  ```

- For local development:
  ```sh
  npm start
  ```

- For cloud deployment:
  ```sh
  npm run deploy
  ```

## Using the plugin
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
      headers: {}
      session: {}
      rawRequest:
        query: {}
        variables: {}
```

Build DDN supergraph:
  ```sh
  ddn supergraph build
  ```
