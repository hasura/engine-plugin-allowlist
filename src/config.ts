export const Config = {
  // The authentication header
  headers: {
    "hasura-m-auth": "zZkhKqFjqXR4g5MZCsJUZCnhCcoPyZ",
  },
  // The allowlist of queries
  allowlist: [
    "query IntrospectionQuery{__schema{queryType{name}mutationType{name}subscriptionType{name}types{...FullType}directives{name description locations args{...InputValue}}}}fragment FullType on __Type{kind name description fields(includeDeprecated:true){name description args{...InputValue}type{...TypeRef}isDeprecated deprecationReason}inputFields{...InputValue}interfaces{...TypeRef}enumValues(includeDeprecated:true){name description isDeprecated deprecationReason}possibleTypes{...TypeRef}}fragment InputValue on __InputValue{name description type{...TypeRef}defaultValue}fragment TypeRef on __Type{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name}}}}}}}}}}",
    "query MyQuery { __typename }",
  ],
  // The roles allowed to bypass the allowlist
  allowedRoles: [],
};
