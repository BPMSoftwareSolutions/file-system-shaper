import { encodePayload } from "./codec.js";

export function fetchApi() {
  return encodePayload({ status: "ok" });
}
