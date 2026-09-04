import assert from "node:assert";
import {
  parseCommitteeCSV,
  normalizePositionToId,
  generateSampleCommitteeCSV,
} from "../../src/lib/csvHelpers";

async function testCommitteeCsvUploadFeature() {
  console.log("▶ Testing Committee CSV Parsing, Normalization & Sample Template...");

  // 1. Test Position Normalization
  console.log("1. Testing designation normalization...");
  assert.strictEqual(normalizePositionToId("President"), "president");
  assert.strictEqual(normalizePositionToId("Vice President"), "vice_president");
  assert.strictEqual(normalizePositionToId("General Secretary"), "general_secretary");
  assert.strictEqual(normalizePositionToId("Joint Secretary"), "joint_secretary");
  assert.strictEqual(normalizePositionToId("Treasurer"), "treasurer");
  assert.strictEqual(normalizePositionToId("Organizing Secretary"), "organizing_secretary");
  assert.strictEqual(normalizePositionToId("Publicity Secretary"), "publicity_secretary");
  assert.strictEqual(normalizePositionToId("Cultural Secretary"), "cultural_secretary");
  assert.strictEqual(normalizePositionToId("Sports Secretary"), "sports_secretary");
  assert.strictEqual(normalizePositionToId("Senior Advisor"), "executive_member");
  assert.strictEqual(normalizePositionToId("Member"), "executive_member");
  console.log("✓ Position normalization verified across all standard designations!");

  // 2. Test Sample CSV Template Generation
  console.log("2. Testing sample CSV template generation...");
  const sample = generateSampleCommitteeCSV();
  assert(sample.includes("Full Name,Designation,Department,Series,Session,Photo URL,Bio,Display Order"));
  assert(sample.includes("President"));
  assert(sample.includes("General Secretary"));
  console.log("✓ Sample CSV template content verified!");

  // 3. Test CSV Parsing with standard commas
  console.log("3. Testing CSV parsing with valid records...");
  const validCsv = `Full Name,Designation,Department,Series,Session,Bio,Display Order
Engr. Hasan Ali,President,Computer Science & Engineering,18,2018-2019,Active President,1
Mustafizur Rahman,General Secretary,Electrical & Electronic Engineering,18,2018-2019,General affairs,2
Sadia Afrin,Vice President,Civil Engineering,18,2018-2019,,3`;

  const { rows, errors } = parseCommitteeCSV(validCsv);
  assert.strictEqual(errors.length, 0, "No errors expected for valid CSV");
  assert.strictEqual(rows.length, 3, "Expected 3 parsed member rows");
  assert.strictEqual(rows[0].name, "Engr. Hasan Ali");
  assert.strictEqual(rows[0].designation, "President");
  assert.strictEqual(rows[0].department, "Computer Science & Engineering");
  assert.strictEqual(rows[0].series, "18");
  assert.strictEqual(rows[0].displayOrder, 1);
  console.log("✓ CSV parser successfully parsed all 3 records!");

  // 4. Test Error Handling for Missing Name Column
  console.log("4. Testing invalid CSV without name header...");
  const invalidCsv = `Designation,Department,Series
President,CSE,18`;
  const invalidResult = parseCommitteeCSV(invalidCsv);
  assert(invalidResult.errors.length > 0, "Errors expected when Full Name column is missing");
  console.log("✓ Error correctly generated for missing Full Name column!");

  console.log("\n=======================================================");
  console.log("✓ ALL COMMITTEE CSV PARSING TESTS PASSED SUCCESSFULLY");
  console.log("=======================================================");
}

testCommitteeCsvUploadFeature().catch((err) => {
  console.error("Committee CSV test failed:", err);
  process.exit(1);
});
