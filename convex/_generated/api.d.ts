/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as ai from "../ai.js";
import type * as applications from "../applications.js";
import type * as auth from "../auth.js";
import type * as challenges from "../challenges.js";
import type * as coverLetters from "../coverLetters.js";
import type * as crons from "../crons.js";
import type * as internships from "../internships.js";
import type * as lib_auth_helpers from "../lib/auth_helpers.js";
import type * as lib_taxonomy from "../lib/taxonomy.js";
import type * as matching from "../matching.js";
import type * as mockInterviews from "../mockInterviews.js";
import type * as notifications from "../notifications.js";
import type * as passports from "../passports.js";
import type * as profiles from "../profiles.js";
import type * as recruiters from "../recruiters.js";
import type * as repositories from "../repositories.js";
import type * as resumes from "../resumes.js";
import type * as roadmaps from "../roadmaps.js";
import type * as skills from "../skills.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  ai: typeof ai;
  applications: typeof applications;
  auth: typeof auth;
  challenges: typeof challenges;
  coverLetters: typeof coverLetters;
  crons: typeof crons;
  internships: typeof internships;
  "lib/auth_helpers": typeof lib_auth_helpers;
  "lib/taxonomy": typeof lib_taxonomy;
  matching: typeof matching;
  mockInterviews: typeof mockInterviews;
  notifications: typeof notifications;
  passports: typeof passports;
  profiles: typeof profiles;
  recruiters: typeof recruiters;
  repositories: typeof repositories;
  resumes: typeof resumes;
  roadmaps: typeof roadmaps;
  skills: typeof skills;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
