const BASE = "http://localhost:3000/api";
let passed = 0;
let failed = 0;
const state = {};

async function req(method, path, body) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
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

async function testCascadeDelete() {
  console.log("\n--- CASCADE DELETE ---");

  const before = await req("GET", `/trackers?petId=${state.petId}`);
  assert("Pet has trackers before delete", before.data.length > 0);

  const del = await req("DELETE", `/pets/${state.petId}`);
  assert("DELETE /pets/:id → 200", del.status === 200);

  const after = await req("GET", `/trackers?petId=${state.petId}`);
  assert("Trackers cascade deleted", after.data.length === 0);
}

async function cleanup() {
  console.log("\n--- CLEANUP ---");
  if (state.petId2) await req("DELETE", `/pets/${state.petId2}`);
  console.log("  Cleaned up test data");
}

async function main() {
  console.log("=== BuddyTracker API Test Suite ===");
  console.log(`Target: ${BASE}\n`);

  try {
    await testPets();
    await testTrackers();
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
