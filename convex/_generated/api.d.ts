/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as bluetooth from "../bluetooth.js";
import type * as http from "../http.js";
import type * as maps from "../maps.js";
import type * as players from "../players.js";
import type * as races from "../races.js";
import type * as router from "../router.js";
import type * as shop from "../shop.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  bluetooth: typeof bluetooth;
  http: typeof http;
  maps: typeof maps;
  players: typeof players;
  races: typeof races;
  router: typeof router;
  shop: typeof shop;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
