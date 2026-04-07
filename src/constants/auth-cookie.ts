/**
 * JWT stored with js-cookie (readable by JS; not httpOnly).
 * Same name is read by Next middleware from the `Cookie` header on `/admin/*`.
 */
export const AUTH_JWT_COOKIE_NAME = "hpk_jwt";
