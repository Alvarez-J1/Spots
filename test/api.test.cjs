const { test, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "../src/utils/Api.js"), "utf8");
const apiModule = import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });
async function client() {
  const { default: Api } = await apiModule;
  return new Api({ baseUrl: "https://example.test/v1", headers: {} });
}

test("profile requests return the server payload", async () => {
  const profile = { name: "Photographer", about: "Places", avatar: "avatar.png" };
  global.fetch = async () => Response.json(profile);
  assert.deepEqual(await (await client()).getUserInfo(), profile);
});

test("deletion accepts an empty 204 response", async () => {
  global.fetch = async () => new Response(null, { status: 204 });
  assert.equal(await (await client()).removeCard("card-id"), null);
});

test("non-JSON HTTP errors remain readable", async () => {
  global.fetch = async () => new Response("offline", { status: 503, statusText: "Service Unavailable" });
  await assert.rejects((await client()).getUserInfo(), /Service Unavailable/);
});

test("non-text and blank API messages fall back to the HTTP status", async () => {
  for (const message of [{ detail: "invalid" }, "   "]) {
    global.fetch = async () => Response.json({ message }, { status: 400, statusText: "Bad Request" });
    await assert.rejects((await client()).getUserInfo(), /Bad Request/);
  }
});

test("card identifiers remain a single encoded URL segment", async () => {
  global.fetch = async (url, options) => {
    assert.equal(url, "https://example.test/v1/cards/card%2Fwith%3F%23%20spaces");
    assert.equal(options.method, "DELETE");
    return new Response(null, { status: 204 });
  };
  await (await client()).removeCard("card/with?# spaces");
});
