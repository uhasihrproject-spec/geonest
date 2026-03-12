import crypto from "node:crypto";

export function signPayload(body: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

export function verifySignature(body: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = signPayload(body, secret);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
