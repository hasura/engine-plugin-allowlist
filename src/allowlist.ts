import { Config } from "./config";
import { parse } from "graphql";
import { trace, SpanStatusCode } from "@opentelemetry/api";

interface PreParsePluginRequest {
  rawRequest: {
    query: string;
  };
  session: {
    role: string;
  };
}

// OTLP setup
const tracer = trace.getTracer("allow-list-plugin");

// Create a hashset of the allowlist queries for fast lookup
let allowlist = Config.allowlist;
let hashSetAllowlist = new Set();
for (let i = 0; i < allowlist.length; i++) {
  hashSetAllowlist.add(
    JSON.stringify(parse(allowlist[i], { noLocation: true }).definitions),
  );
}

export const allowlistHandler = (request) => {
  return tracer.startActiveSpan("Handle request", async (span) => {
    // Authentication
    if (
      request.headers === null ||
      request.headers.get("hasura-m-auth") !== Config.headers["hasura-m-auth"]
    ) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: String("Unauthorized request!"),
      });
      span.end();
      let response = new Blob([
        JSON.stringify({ message: "unauthorized request" }),
      ]);
      return new Response(response, { status: 400 });
    }
    // Parse the query
    let rawRequest = <PreParsePluginRequest>await request.json();

    if (rawRequest.rawRequest && rawRequest.rawRequest.query) {
      const query = rawRequest.rawRequest.query;
      // All queries are allowed for superuser roles
      if (
        Config.allowedRoles.length > 0 &&
        Config.allowedRoles.includes(rawRequest.session.role)
      ) {
        span.setStatus({
          code: SpanStatusCode.OK,
          message: String("Superuser role!"),
        });
        span.setAttribute("internal.visibility", String("user"));
        span.end();
        return new Response(null, { status: 204 });
      }
      try {
        // Parse the graphql query
        const parsedQuery = parse(query, { noLocation: true }).definitions;
        const stringifiedParsedQuery = JSON.stringify(parsedQuery);
        // Check if the query is in the allowlist
        if (hashSetAllowlist.has(stringifiedParsedQuery)) {
          span.setStatus({
            code: SpanStatusCode.OK,
            message: String("Query allowed!"),
          });
          span.setAttribute("internal.visibility", String("user"));
          span.end();
          return new Response(null, { status: 204 });
        } else {
          span.setStatus({
            code: SpanStatusCode.OK,
            message: String("Query not allowed!"),
          });
          span.setAttribute("internal.visibility", String("user"));
          span.end();
          let response = new Blob([
            JSON.stringify({ message: "Query not allowed" }),
          ]);
          return new Response(response, { status: 400 });
        }
      } catch (e) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: String("Malformed request! " + e),
        });
        span.end();
        let response = new Blob([
          JSON.stringify({ message: "Malformed request" }),
        ]);
        return new Response(response, { status: 500 });
      }
    } else {
      span.setStatus({
        code: SpanStatusCode.OK,
        message: String("Malformed request!"),
      });
      span.setAttribute("internal.visibility", String("internal"));
      span.end();
      let response = new Blob([
        JSON.stringify({ message: "Malformed request" }),
      ]);
      return new Response(response, { status: 500 });
    }
  });
};
