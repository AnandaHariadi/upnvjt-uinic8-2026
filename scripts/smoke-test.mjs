#!/usr/bin/env node
/**
 * PACUL smoke test — run against a running server:
 *   npm run build && npm run start   (in one terminal)
 *   npm run test:smoke               (in another; BASE_URL defaults to http://localhost:3000)
 *
 * Checks page routing/auth gating, security headers and the verification/OCR
 * API contracts (validation errors, demo/live mode, safeguards).
 */
import assert from "node:assert/strict";
import sharp from "sharp";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✔ ${name}`);
  } catch (e) {
    failed++;
    console.log(`  ✘ ${name}\n      ${e.message}`);
  }
}

const png = (w, h, color = { r: 45, g: 95, b: 63 }) =>
  sharp({ create: { width: w, height: h, channels: 3, background: color } }).png().toBuffer();

function form(fields) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

const post = (path, fd) => fetch(`${BASE}${path}`, { method: "POST", body: fd });

console.log(`PACUL smoke test → ${BASE}\n`);

console.log("Pages & gating");
for (const path of ["/", "/login", "/register", "/demo", "/gov/login", "/manifest.json", "/sw.js", "/sw-push.js"]) {
  await test(`GET ${path} → 200`, async () => {
    const r = await fetch(`${BASE}${path}`, { redirect: "manual" });
    assert.equal(r.status, 200);
  });
}
for (const path of ["/dashboard", "/dashboard/eco-action", "/dashboard/marketplace", "/dashboard/map", "/dashboard/laporan-sampah", "/dashboard/tracker", "/dashboard/step-tracker", "/dashboard/collaboration", "/dashboard/profile", "/dashboard/profile/edit"]) {
  await test(`GET ${path} without session → redirect to /login`, async () => {
    const r = await fetch(`${BASE}${path}`, { redirect: "manual" });
    assert.equal(r.status, 307);
    assert.match(r.headers.get("location") ?? "", /\/login/);
  });
  await test(`GET ${path} with citizen session → 200`, async () => {
    const r = await fetch(`${BASE}${path}`, { redirect: "manual", headers: { cookie: "pacul_token=demo_token_demo" } });
    assert.equal(r.status, 200);
  });
}
await test("GET /gov/dashboard with only a citizen session → redirect to /gov/login", async () => {
  const r = await fetch(`${BASE}/gov/dashboard`, { redirect: "manual", headers: { cookie: "pacul_token=demo_token_demo" } });
  assert.equal(r.status, 307);
  assert.match(r.headers.get("location") ?? "", /\/gov\/login/);
});
await test("GET /gov/dashboard with gov session → 200", async () => {
  const r = await fetch(`${BASE}/gov/dashboard`, { redirect: "manual", headers: { cookie: "pacul_gov_token=demo_gov_token_officer" } });
  assert.equal(r.status, 200);
});

console.log("\nSecurity headers");
await test("CSP, Permissions-Policy (camera=self), nosniff present", async () => {
  const r = await fetch(`${BASE}/`);
  assert.match(r.headers.get("content-security-policy") ?? "", /default-src 'self'/);
  assert.match(r.headers.get("permissions-policy") ?? "", /camera=\(self\)/);
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.equal(r.headers.get("x-powered-by"), null);
});

console.log("\nGreen action verification API");
let mode = "demo";
await test("GET /api/eco-action/verify reports mode without secrets", async () => {
  const r = await fetch(`${BASE}/api/eco-action/verify`);
  const j = await r.json();
  assert.ok(["demo", "live"].includes(j.mode));
  assert.ok(!JSON.stringify(j).match(/AIza|key/i), "response must not contain key material");
  mode = j.mode;
});
await test("rejects unknown action type (400)", async () => {
  const r = await post("/api/eco-action/verify", form({ actionType: "flying", image: new Blob([await png(640, 480)], { type: "image/png" }) }));
  assert.equal(r.status, 400);
});
await test("rejects missing image (400)", async () => {
  const r = await post("/api/eco-action/verify", form({ actionType: "waste_sorting" }));
  assert.equal(r.status, 400);
});
await test("rejects non-image bytes disguised as JPEG (415)", async () => {
  const r = await post("/api/eco-action/verify", form({ actionType: "waste_sorting", image: new Blob(["hello, not an image"], { type: "image/jpeg" }) }));
  assert.equal(r.status, 415);
});
await test("rejects images below 320px (400)", async () => {
  const r = await post("/api/eco-action/verify", form({ actionType: "waste_sorting", image: new Blob([await png(200, 200)], { type: "image/png" }) }));
  assert.equal(r.status, 400);
  assert.match((await r.json()).error, /resolution/i);
});
await test("rejects files over 5 MB (413)", async () => {
  const big = new Uint8Array(5 * 1024 * 1024 + 10);
  big.set([0xff, 0xd8, 0xff]);
  const r = await post("/api/eco-action/verify", form({ actionType: "waste_sorting", image: new Blob([big], { type: "image/jpeg" }) }));
  assert.equal(r.status, 413);
});
const unique = await png(640, 480, { r: Math.floor(Math.random() * 255), g: 120, b: 80 });
await test("valid image returns a structured result", async () => {
  const r = await post("/api/eco-action/verify", form({ actionType: "tree_planting", capturedAt: String(Date.now()), image: new Blob([unique], { type: "image/png" }) }));
  assert.equal(r.status, 200);
  const j = await r.json();
  for (const k of ["status", "mode", "provider", "actionType", "reason", "flags", "detectedLabels", "imageHash", "checkedAt"]) assert.ok(k in j, `missing ${k}`);
  assert.ok(["verified", "flagged", "rejected"].includes(j.status));
  assert.equal(j.actionType, "tree_planting");
  if (mode === "demo") {
    assert.equal(j.mode, "demo");
    assert.equal(j.status, "verified");
    assert.equal(j.modelConfidence, null, "demo mode must not report a confidence");
    assert.match(j.reason, /^DEMO/);
  }
});
await test("resubmitting the same image is flagged as a duplicate", async () => {
  const r = await post("/api/eco-action/verify", form({ actionType: "tree_planting", image: new Blob([unique], { type: "image/png" }) }));
  const j = await r.json();
  assert.ok(j.flags.includes("duplicate_image"));
  assert.equal(j.status === "verified", false);
});
await test("old evidence (capturedAt > 72 h) is flagged", async () => {
  const img = await png(640, 480, { r: 10, g: Math.floor(Math.random() * 255), b: 10 });
  const r = await post("/api/eco-action/verify", form({ actionType: "waste_sorting", capturedAt: String(Date.now() - 5 * 86400_000), image: new Blob([img], { type: "image/png" }) }));
  const j = await r.json();
  assert.ok(j.flags.includes("stale_evidence"));
});

console.log("\nElectricity Bill OCR API");
await test("rejects non-image upload", async () => {
  const r = await post("/api/ocr/scan-bill", form({ image: new Blob(["nope"], { type: "image/png" }) }));
  assert.equal(r.status, 415);
});
await test("valid image returns OCR payload (demo or live)", async () => {
  const r = await post("/api/ocr/scan-bill", form({ image: new Blob([await png(800, 600, { r: 250, g: 250, b: 250 })], { type: "image/png" }) }));
  const j = await r.json();
  assert.ok("success" in j);
  if (mode === "demo") {
    assert.equal(j.mode, "demo");
    assert.equal(j.success, true);
  }
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
