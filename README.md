# engine-plugin-allowlist

Allowlist engine plugin for Hasura DDN.

Hasura DDN lets you extend the supergraph with engine plugins ([docs](https://hasura.io/docs/3.0/plugins/overview/)). This plugin allowlists the GraphQL requests that reach your DDN supergraph: requests that aren't on the allowlist are rejected before they're parsed.

> **Note:** This plugin must be used as a **pre-parse** plugin.

## How it works

The plugin runs a server that receives each incoming request from the DDN engine, authenticates it with a shared secret, and checks the GraphQL query against the configured allowlist. Allowed queries are passed through; disallowed queries return an error response that is visible to the end user. Roles listed in `allowedRoles` bypass the per-query check and may run any query.

## Configuration

Configure the plugin in `src/config.ts`:

- `headers.hasura-m-auth` — shared secret used to authenticate requests coming from the DDN engine. **Replace the checked-in default with your own secret before deploying.**
- `allowlist` — the list of GraphQL queries that are allowed to run.
- `allowedRoles` — roles that are allowed to run any query, bypassing the allowlist.

### Observability (optional)

Traces are exported via OpenTelemetry. Set these in `wrangler.toml` (or your worker's environment vars):

- `OTEL_EXPORTER_OTLP_ENDPOINT` — your OTLP collector endpoint.
- `OTEL_EXPORTER_PAT` — Hasura PAT used to authenticate trace export. This is required for end-to-end tracing with Hasura DDN.

## Development

The plugin is written in TypeScript. The source lives in the `src` directory, and the core allowlist logic is in `src/allowlist.ts`.

It is deployed with Cloudflare Wrangler, but you can adapt the files for any other host.

### Setup

Clone the repo and install dependencies:

```sh
git clone https://github.com/hasura/engine-plugin-allowlist
cd engine-plugin-allowlist
npm install
```

Alternatively, this repo ships a Nix flake with direnv. With Nix and direnv installed, run `direnv allow` to drop into a dev shell with the toolchain ready. This is the path CI uses.

### Local development

Start a local dev server:

```sh
npm start
```

It listens on port `8787` by default. The server URL is printed in the terminal.

### Checks

- `npm run typecheck` — type-check with `tsc`.
- `npm run lint` — check formatting with Prettier.
- `npm run format` — apply Prettier formatting.

These run in CI on every push.

### Cloud deployment

Deploy to Cloudflare Workers:

- Create a Cloudflare account.
- Log in: `wrangler login`
- Deploy: `npm run deploy`

The deployed plugin URL is printed in the terminal.

> Wrangler ships as a dev dependency, so run it via the npm scripts above or `npx wrangler`.

## Using the plugin in DDN

Update the metadata to add the plugin config (in the global subgraph), and add env vars for the local-dev and cloud-deployment URLs:

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

Build the DDN supergraph: `ddn supergraph build create`

> **Note:** For end-to-end tracing, set the Hasura PAT in the `OTEL_EXPORTER_PAT` var (see [Observability](#observability-optional)).
