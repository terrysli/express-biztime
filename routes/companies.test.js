"use strict";

process.env.NODE_ENV = "test";

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


/** GET / return {companies: [{code, name}, ...]} */

describe("GET /companies", function () {
  test("Gets all companies", async function () {
    debugger;
    // let result = await db.query(
    //   `SELECT code, name, description
    //     FROM companies`
    // );
    // console.log("rows:",result.rows);
    const resp = await request(app).get("/companies");
    expect(resp.body).toEqual({
      companies: [{
        code: testCo.code,
        name: testCo.name
      }]
    });
  });
});


/** GET /[code] - return data about one company:
 * `{company: {code, name, description, invoices: [id, ...]}}` */

