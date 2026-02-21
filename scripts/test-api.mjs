import { writeFileSync, unlinkSync } from "node:fs";
import path from "node:path";

const BASE = "http://localhost:3000/api";
let passed = 0;
let failed = 0;
const state = {};

async function req(method, url, body) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${url}`, opts);
  const data = await res.json();
  return { status: res.status, data };
}

async function upload(filePath) {
  const blob = new Blob(["\x89PNG\r\n\x1a\n dummy png content"], { type: "image/png" });
  const form = new FormData();
  form.append("file", blob, "test-image.png");
  const res = await fetch(`${BASE}/upload`, { method: "POST", body: form });
  const data = await res.json();
  return { status: res.status, data };
}

function assert(label, condition) {
  if (condition) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}`);
    failed++;
  }
}

// ─── PETS ────────────────────────────────────────────────

async function testPets() {
  console.log("\n--- PET CRUD ---");

  const create = await req("POST", "/pets", {
    name: "TestDog", gender: "Male", age: 5, species: "Dog", breed: "Labrador",
  });
  assert("POST /pets → 201", create.status === 201);
  assert("POST /pets → has petId", !!create.data.petId);
  state.petId = create.data.petId;

  const create2 = await req("POST", "/pets", {
    name: "TestCat", gender: "Female", age: 3, species: "Cat", breed: "Persian",
  });
  state.petId2 = create2.data.petId;

  const list = await req("GET", "/pets");
  assert("GET /pets → 200", list.status === 200);
  assert("GET /pets → array >= 2", Array.isArray(list.data) && list.data.length >= 2);

  const single = await req("GET", `/pets/${state.petId}`);
  assert("GET /pets/:id → 200", single.status === 200);
  assert("GET /pets/:id → correct name", single.data.name === "TestDog");
  assert("GET /pets/:id → includes trackers", Array.isArray(single.data.trackers));

  const update = await req("PATCH", `/pets/${state.petId}`, { name: "UpdatedDog", age: 6 });
  assert("PATCH /pets/:id → 200", update.status === 200);
  assert("PATCH /pets/:id → name updated", update.data.name === "UpdatedDog");
  assert("PATCH /pets/:id → age updated", update.data.age === 6);

  const notFound = await req("GET", "/pets/nonexistent-id");
  assert("GET /pets/bad-id → 404", notFound.status === 404);

  const badCreate = await req("POST", "/pets", { name: "" });
  assert("POST /pets invalid → 400", badCreate.status === 400);
}

// ─── TRACKERS ────────────────────────────────────────────

async function testTrackers() {
  console.log("\n--- TRACKER CRUD ---");

  const create = await req("POST", "/trackers", {
    name: "Medication Log",
    petId: state.petId,
    options: [
      { fieldName: "Medication", fieldType: "Text" },
      { fieldName: "Dosage", fieldType: "Decimal" },
      { fieldName: "Date Given", fieldType: "Date" },
    ],
  });
  assert("POST /trackers → 201", create.status === 201);
  assert("POST /trackers → has id", typeof create.data.id === "number");
  assert("POST /trackers → 3 options", create.data.options?.length === 3);
  state.trackerId = create.data.id;

  const create2 = await req("POST", "/trackers", {
    name: "Weight Log",
    petId: state.petId,
    options: [{ fieldName: "Weight", fieldType: "Decimal" }],
  });
  state.trackerId2 = create2.data.id;

  const listAll = await req("GET", "/trackers");
  assert("GET /trackers → 200", listAll.status === 200);
  assert("GET /trackers → array >= 2", Array.isArray(listAll.data) && listAll.data.length >= 2);

  const listFiltered = await req("GET", `/trackers?petId=${state.petId}`);
  assert("GET /trackers?petId → filtered", listFiltered.data.every(t => t.petId === state.petId));

  const single = await req("GET", `/trackers/${state.trackerId}`);
  assert("GET /trackers/:id → 200", single.status === 200);
  assert("GET /trackers/:id → includes options", single.data.options?.length === 3);
  assert("GET /trackers/:id → includes pet", !!single.data.pet?.name);

  const update = await req("PATCH", `/trackers/${state.trackerId}`, {
    name: "Updated Medication Log",
    options: [
      { fieldName: "Medication", fieldType: "Text" },
      { fieldName: "Dosage", fieldType: "Decimal" },
      { fieldName: "Date Given", fieldType: "Date" },
      { fieldName: "Notes", fieldType: "Text" },
    ],
  });
  assert("PATCH /trackers/:id → 200", update.status === 200);
  assert("PATCH /trackers/:id → name updated", update.data.name === "Updated Medication Log");
  assert("PATCH /trackers/:id → 4 options now", update.data.options?.length === 4);

  const del = await req("DELETE", `/trackers/${state.trackerId2}`);
  assert("DELETE /trackers/:id → 200", del.status === 200);

  const afterDel = await req("GET", `/trackers?petId=${state.petId}`);
  assert("DELETE /trackers → count decreased", afterDel.data.length < listAll.data.length);
}

// ─── ENTRIES ─────────────────────────────────────────────

async function testEntries() {
  console.log("\n--- ENTRY CRUD ---");

  const create = await req("POST", "/entries", {
    trackerId: state.trackerId,
    petId: state.petId,
    data: [
      { fieldName: "Medication", fieldType: "Text", fieldValue: "Amoxicillin" },
      { fieldName: "Dosage", fieldType: "Decimal", fieldValue: "250" },
      { fieldName: "Date Given", fieldType: "Date", fieldValue: "2026-02-21" },
      { fieldName: "Notes", fieldType: "Text", fieldValue: "Morning dose" },
    ],
  });
  assert("POST /entries → 201", create.status === 201);
  assert("POST /entries → has id", typeof create.data.id === "number");
  assert("POST /entries → 4 data fields", create.data.data?.length === 4);
  assert("POST /entries → images array", Array.isArray(create.data.images));
  state.entryId = create.data.id;

  const create2 = await req("POST", "/entries", {
    trackerId: state.trackerId,
    petId: state.petId,
    data: [
      { fieldName: "Medication", fieldType: "Text", fieldValue: "Ibuprofen" },
      { fieldName: "Dosage", fieldType: "Decimal", fieldValue: "100" },
      { fieldName: "Date Given", fieldType: "Date", fieldValue: "2026-02-20" },
      { fieldName: "Notes", fieldType: "Text", fieldValue: "Evening dose" },
    ],
  });
  state.entryId2 = create2.data.id;

  const list = await req("GET", `/entries?trackerId=${state.trackerId}`);
  assert("GET /entries?trackerId → 200", list.status === 200);
  assert("GET /entries?trackerId → array >= 2", Array.isArray(list.data) && list.data.length >= 2);
  assert("GET /entries → includes data", list.data[0].data?.length > 0);

  const single = await req("GET", `/entries/${state.entryId}`);
  assert("GET /entries/:id → 200", single.status === 200);
  assert("GET /entries/:id → includes data", single.data.data?.length === 4);
  assert("GET /entries/:id → includes tracker with options", single.data.tracker?.options?.length > 0);
  assert("GET /entries/:id → correct field value", single.data.data.find(d => d.fieldName === "Medication")?.fieldValue === "Amoxicillin");

  const update = await req("PATCH", `/entries/${state.entryId}`, {
    data: [
      { fieldName: "Medication", fieldType: "Text", fieldValue: "Amoxicillin 500mg" },
      { fieldName: "Dosage", fieldType: "Decimal", fieldValue: "500" },
      { fieldName: "Date Given", fieldType: "Date", fieldValue: "2026-02-21" },
      { fieldName: "Notes", fieldType: "Text", fieldValue: "Updated dose" },
    ],
  });
  assert("PATCH /entries/:id → 200", update.status === 200);
  assert("PATCH /entries/:id → data updated", update.data.data.find(d => d.fieldName === "Dosage")?.fieldValue === "500");

  const del = await req("DELETE", `/entries/${state.entryId2}`);
  assert("DELETE /entries/:id → 200", del.status === 200);

  const afterDel = await req("GET", `/entries?trackerId=${state.trackerId}`);
  assert("DELETE /entries → count decreased", afterDel.data.length === 1);
}

// ─── UPLOAD ──────────────────────────────────────────────

async function testUpload() {
  console.log("\n--- IMAGE UPLOAD ---");

  const up = await upload();
  assert("POST /upload → 201", up.status === 201);
  assert("POST /upload → has url", typeof up.data.url === "string" && up.data.url.startsWith("/uploads/"));
  assert("POST /upload → has filename", typeof up.data.filename === "string");

  // Test invalid type
  const badForm = new FormData();
  badForm.append("file", new Blob(["not an image"], { type: "text/plain" }), "test.txt");
  const badRes = await fetch(`${BASE}/upload`, { method: "POST", body: badForm });
  const badData = await badRes.json();
  assert("POST /upload bad type → 400", badRes.status === 400);
  assert("POST /upload bad type → error msg", badData.error?.includes("Invalid file type"));

  // Test no file
  const emptyForm = new FormData();
  const emptyRes = await fetch(`${BASE}/upload`, { method: "POST", body: emptyForm });
  assert("POST /upload no file → 400", emptyRes.status === 400);
}

// ─── CASCADE DELETE ──────────────────────────────────────

async function testCascadeDelete() {
  console.log("\n--- CASCADE DELETE ---");

  const beforeTrackers = await req("GET", `/trackers?petId=${state.petId}`);
  assert("Pet has trackers before delete", beforeTrackers.data.length > 0);

  const beforeEntries = await req("GET", `/entries?trackerId=${state.trackerId}`);
  assert("Tracker has entries before delete", beforeEntries.data.length > 0);

  const del = await req("DELETE", `/pets/${state.petId}`);
  assert("DELETE /pets/:id → 200", del.status === 200);

  const afterTrackers = await req("GET", `/trackers?petId=${state.petId}`);
  assert("Trackers cascade deleted", afterTrackers.data.length === 0);

  const afterEntries = await req("GET", `/entries?trackerId=${state.trackerId}`);
  assert("Entries cascade deleted", afterEntries.data.length === 0);
}

// ─── CLEANUP ─────────────────────────────────────────────

async function cleanup() {
  console.log("\n--- CLEANUP ---");
  if (state.petId2) await req("DELETE", `/pets/${state.petId2}`);
  console.log("  Cleaned up test data");
}

// ─── MAIN ────────────────────────────────────────────────

async function main() {
  console.log("=== BuddyTracker API Test Suite ===");
  console.log(`Target: ${BASE}\n`);

  try {
    await testPets();
    await testTrackers();
    await testEntries();
    await testUpload();
    await testCascadeDelete();
    await cleanup();
  } catch (err) {
    console.error("\nFATAL:", err.message);
    failed++;
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
