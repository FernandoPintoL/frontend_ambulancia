// @ts-nocheck
/// <reference types="react-scripts" />

interface ImportMetaEnv {
  readonly REACT_APP_GRAPHQL_URL?: string;
  readonly REACT_APP_WS_URL?: string;
  readonly REACT_APP_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
