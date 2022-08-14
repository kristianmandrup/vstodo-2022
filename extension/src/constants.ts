export const _prod_ = process.env.NODE_ENV === "production";
export const apiBaseUrl = _prod_
  ? process.env.API_BASE_URL
  : "http://localhost:3002";
