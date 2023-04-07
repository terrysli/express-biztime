"use strict";

console.log(process.env.NODE_ENV);

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testCo;

beforeEach(async function () {
  await db.query("DELETE FROM companies");

  const result = await db.query(
    `INSERT INTO companies (code, name, description)
      VALUES ('testco', 'Test Company', 'Test description')
    RETURNING code, name, description`
  );
  testCo = result.rows[0];
});

afterAll(async function () {
  await db.end();
});


/** GET / return {companies: [{code, name}, ...]} */

describe("GET /companies", function () {
  test("Gets all companies", async function () {
    const resp = await request(app).get("/companies");
    expect(resp.body).toEqual({
      companies: [{
        code: testCo.code,
        name: testCo.name,
      }]
    });
  });
});


/** GET /[code] - return data about one company:
 * `{company: {code, name, description, invoices: [id, ...]}}` */

describe("GET /[code]", function () {
  test("Get a company", async function () {
    const resp = await request(app).get(`/companies/${testCo.code}`);
    expect(resp.body).toEqual({
      company: {
        code: testCo.code,
        name: testCo.name,
        description: testCo.description,
        invoices: []
      }
    });
  });

  test("Get a non-existent company", async function () {
    const resp = await request(app).get(`/companies/blah`);
    expect(resp.status).toEqual(404);
  })
});


