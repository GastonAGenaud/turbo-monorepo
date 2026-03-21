import { createHmac, randomInt, randomUUID, timingSafeEqual } from "node:crypto";

const CAPTCHA_TTL_MS = 10 * 60 * 1000;

function secret() {
  return process.env.CAPTCHA_SECRET ?? process.env.NEXTAUTH_SECRET ?? "ggseeds-dev-captcha-secret";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createCaptchaChallenge() {
  const left = randomInt(2, 10);
  const right = randomInt(1, 10);
  const payload = JSON.stringify({
    left,
    right,
    answer: left + right,
    exp: Date.now() + CAPTCHA_TTL_MS,
    nonce: randomUUID(),
  });

  const encoded = Buffer.from(payload).toString("base64url");
  return {
    prompt: `¿Cuánto es ${left} + ${right}?`,
    token: `${encoded}.${sign(encoded)}`,
  };
}

export function verifyCaptchaChallenge(token: string, rawAnswer: string) {
  try {
    const [encoded, signature] = token.split(".");
    if (!encoded || !signature) {
      return false;
    }

    const expected = sign(encoded);
    if (signature.length !== expected.length) {
      return false;
    }

    const validSignature = timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    if (!validSignature) {
      return false;
    }

    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as {
      answer: number;
      exp: number;
    };

    if (!Number.isFinite(payload.exp) || Date.now() > payload.exp) {
      return false;
    }

    const answer = Number(String(rawAnswer).trim());
    return Number.isFinite(answer) && answer === payload.answer;
  } catch {
    return false;
  }
}
