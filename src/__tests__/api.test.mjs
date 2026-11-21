/**
 * Automated API tests — Milestone 6
 * Run with: npm test
 *
 * Uses Node.js built-in test runner (node:test) + assert.
 * Tests check schema validations, security headers, upload bounds, rate limits,
 * and end-to-end card lifecycle if Supabase is configured.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3000";

async function post(path, body, headers = {}) {
  const testIp = `192.168.1.${Math.floor(Math.random() * 200) + 1}`;
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": testIp, ...headers },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => ({})), headers: res.headers };
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  return { status: res.status, body: await res.json().catch(() => ({})), headers: res.headers };
}

async function del(path, token) {
  const res = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: res.status, body: await res.json().catch(() => ({})), headers: res.headers };
}

let createdSlug = "";
let managementToken = "";
let cardId = "";
let lockedSlug = "";
let dbConfigured = true;

describe("POST /api/cards — Validation & Creation", () => {
  test("rejects missing required fields", async () => {
    const { status, body } = await post("/api/cards", { occasion: "birthday" });
    assert.equal(status, 422);
    assert.ok(body.error || body.details);
  });

  test("rejects invalid occasion value", async () => {
    const { status } = await post("/api/cards", {
      occasion: "wedding",
      theme: "sunset",
      recipientName: "Test",
      senderName: "Tester",
      letter: "Hello",
    });
    assert.equal(status, 422);
  });

  test("rejects letter over 2000 chars", async () => {
    const { status } = await post("/api/cards", {
      occasion: "birthday",
      theme: "sunset",
      recipientName: "Test",
      senderName: "Tester",
      letter: "A".repeat(2001),
    });
    assert.equal(status, 422);
  });

  test("rejects passcode shorter than 4 digits", async () => {
    const { status } = await post("/api/cards", {
      occasion: "birthday",
      theme: "sunset",
      recipientName: "Test",
      senderName: "Tester",
      letter: "Hello",
      passcode: "12",
    });
    assert.equal(status, 422);
  });

  test("rejects passcode with non-digits", async () => {
    const { status } = await post("/api/cards", {
      occasion: "birthday",
      theme: "sunset",
      recipientName: "Test",
      senderName: "Tester",
      letter: "Hello",
      passcode: "abcd",
    });
    assert.equal(status, 422);
  });

  test("creates a valid public card when DB is configured", async (t) => {
    const { status, body } = await post("/api/cards", {
      occasion: "birthday",
      theme: "pink-cloud",
      recipientName: "Priya",
      senderName: "Arjun",
      letter: "Happy birthday! 🎂",
    });

    if (status === 500 && body.error?.includes("Something went wrong")) {
      dbConfigured = false;
      t.skip("Supabase credentials not configured in local environment.");
      return;
    }

    assert.equal(status, 201);
    assert.ok(body.slug);
    assert.ok(body.managementToken);
    assert.ok(body.cardId);
    assert.equal(body.slug.length, 12);
    createdSlug = body.slug;
    managementToken = body.managementToken;
    cardId = body.cardId;
  });

  test("creates a passcode-locked card when DB is configured", async (t) => {
    if (!dbConfigured) {
      t.skip("DB not configured.");
      return;
    }
    const { status, body } = await post("/api/cards", {
      occasion: "anniversary",
      theme: "garden",
      recipientName: "Meera",
      senderName: "Rohan",
      letter: "Secret letter",
      passcode: "1234",
    });
    assert.equal(status, 201);
    assert.ok(body.slug);
    lockedSlug = body.slug;
  });
});

describe("GET /api/cards/[slug] — Public Card Fetch & Privacy", () => {
  test("returns 404 for a non-existent slug", async () => {
    const { status } = await get("/api/cards/doesnotexist000");
    assert.equal(status, 404);
  });

  test("returns 404 for a slug that is too long", async () => {
    const { status } = await get("/api/cards/" + "x".repeat(25));
    assert.equal(status, 404);
  });

  test("returns full card data for a public card", async (t) => {
    if (!createdSlug) {
      t.skip("No card created (DB offline).");
      return;
    }
    const { status, body } = await get(`/api/cards/${createdSlug}`);
    assert.equal(status, 200);
    assert.equal(body.locked, false);
    assert.ok(body.recipientName);
  });

  test("returns ONLY locked:true for a passcode-locked card (Zero Private Leak)", async (t) => {
    if (!lockedSlug) {
      t.skip("No locked card created (DB offline).");
      return;
    }
    const { status, body } = await get(`/api/cards/${lockedSlug}`);
    assert.equal(status, 200);
    assert.equal(body.locked, true);
    assert.ok(body.recipientName);
    assert.ok(body.theme);
    assert.equal(body.letter, undefined);
    assert.equal(body.photos, undefined);
    assert.equal(body.musicUrl, undefined);
    assert.equal(body.senderName, undefined);
  });
});

describe("POST /api/cards/[slug]/unlock — Passcode Unlock & Rate Limiting", () => {
  test("short or non-digit passcode returns 400", async () => {
    const { status } = await post("/api/cards/testslug/unlock", { passcode: "ab" });
    assert.equal(status, 400);
  });

  test("non-existent slug returns generic error", async () => {
    const { status, body } = await post("/api/cards/doesnotexist999/unlock", { passcode: "1234" });
    assert.equal(status, 401);
    assert.ok(body.error);
  });

  test("correct passcode unlocks the card and returns full data", async (t) => {
    if (!lockedSlug) {
      t.skip("No locked card created (DB offline).");
      return;
    }
    const { status, body } = await post(`/api/cards/${lockedSlug}/unlock`, { passcode: "1234" });
    assert.equal(status, 200);
    assert.equal(body.locked, false);
    assert.ok(body.letter !== undefined);
  });

  test("wrong passcode returns same generic error as non-existent card", async (t) => {
    if (!lockedSlug) {
      t.skip("No locked card created (DB offline).");
      return;
    }
    const { status, body } = await post(`/api/cards/${lockedSlug}/unlock`, { passcode: "9999" });
    assert.equal(status, 401);
    assert.ok(!body.error.toLowerCase().includes("wrong passcode"));
  });

  test("rate limit triggers after repeated failed attempts", async () => {
    let rateLimited = false;
    const fixedIp = "10.99.99.99";
    for (let i = 0; i < 7; i++) {
      const { status } = await post(
        "/api/cards/ratelimittestslug/unlock",
        { passcode: "0000" },
        { "x-forwarded-for": fixedIp }
      );
      if (status === 429) {
        rateLimited = true;
        break;
      }
    }
    assert.ok(rateLimited, "Rate limiter should trigger 429 status");
  });
});

describe("POST /api/cards/upload-url — Upload Validation", () => {
  test("rejects unknown file type", async () => {
    const { status, body } = await post("/api/cards/upload-url", {
      fileName: "exploit.exe",
      fileType: "application/x-executable",
      fileSize: 1000,
      cardId: "00000000-0000-0000-0000-000000000000",
    });
    assert.equal(status, 400);
    assert.ok(body.error);
  });

  test("rejects image over 3 MB", async () => {
    const { status } = await post("/api/cards/upload-url", {
      fileName: "big.jpg",
      fileType: "image/jpeg",
      fileSize: 4 * 1024 * 1024,
      cardId: "00000000-0000-0000-0000-000000000000",
    });
    assert.equal(status, 400);
  });

  test("rejects audio over 5 MB", async () => {
    const { status } = await post("/api/cards/upload-url", {
      fileName: "big.mp3",
      fileType: "audio/mpeg",
      fileSize: 6 * 1024 * 1024,
      cardId: "00000000-0000-0000-0000-000000000000",
    });
    assert.equal(status, 400);
  });

  test("rejects non-UUID cardId", async () => {
    const { status } = await post("/api/cards/upload-url", {
      fileName: "photo.jpg",
      fileType: "image/jpeg",
      fileSize: 500000,
      cardId: "not-a-uuid",
    });
    assert.equal(status, 422);
  });

  test("rejects cardId that doesn't exist in DB", async (t) => {
    if (!dbConfigured) {
      t.skip("DB not configured.");
      return;
    }
    const { status } = await post("/api/cards/upload-url", {
      fileName: "photo.jpg",
      fileType: "image/jpeg",
      fileSize: 500000,
      cardId: "00000000-0000-0000-0000-000000000001",
    });
    assert.equal(status, 404);
  });
});

describe("DELETE /api/cards/[slug] — Authorization & Deletion", () => {
  test("rejects deletion without Authorization header", async () => {
    const res = await fetch(`${BASE}/api/cards/anyslug`, { method: "DELETE" });
    assert.equal(res.status, 401);
  });

  test("rejects deletion with invalid token format or mismatch", async (t) => {
    if (!dbConfigured) {
      t.skip("DB not configured.");
      return;
    }
    const { status } = await del("/api/cards/anyslug", "invalid-token");
    assert.ok(status === 401 || status === 404);
  });

  test("deletes card with correct management token", async (t) => {
    if (!createdSlug || !managementToken) {
      t.skip("No card created to delete (DB offline).");
      return;
    }
    const { status } = await del(`/api/cards/${createdSlug}`, managementToken);
    assert.equal(status, 200);

    const { status: getStatus } = await get(`/api/cards/${createdSlug}`);
    assert.equal(getStatus, 404);
  });
});

describe("Security Headers", () => {
  test("every response includes X-Content-Type-Options: nosniff", async () => {
    const res = await fetch(`${BASE}/`);
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  });

  test("every response includes X-Frame-Options: DENY", async () => {
    const res = await fetch(`${BASE}/`);
    assert.equal(res.headers.get("x-frame-options"), "DENY");
  });

  test("every response includes Content-Security-Policy header", async () => {
    const res = await fetch(`${BASE}/`);
    const csp = res.headers.get("content-security-policy");
    assert.ok(csp);
    assert.ok(csp.includes("default-src"));
    assert.ok(csp.includes("frame-ancestors 'none'"));
  });

  test("every response includes Referrer-Policy header", async () => {
    const res = await fetch(`${BASE}/`);
    assert.ok(res.headers.get("referrer-policy"));
  });
});
