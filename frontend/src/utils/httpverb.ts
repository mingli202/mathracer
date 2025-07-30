export const HttpVerb = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
} as const;

export type HttpVerb = (typeof HttpVerb)[keyof typeof HttpVerb];

export function isHTTPVerb(verb: string): verb is HttpVerb {
  return verb in HttpVerb;
}
