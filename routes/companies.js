"use strict";

const express = require("express");
const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = express.Router();

/** GET / return {companies: [{code, name}, ...]} */

router.get("/",
  async function (req, res) {

    const results = await db.query(
      `SELECT code, name
      FROM companies
      ORDER BY name`);
    const companies = results.rows;
    return res.json({ companies });
  });


/** GET /[code] - return data about one company:
 * `{company: {code, name, description, invoices: [id, ...]}}` */

router.get("/:code",
  async function (req, res) {
    const code = req.params.code;

    const cResults = await db.query(
      `SELECT code, name, description
      FROM companies
      WHERE code = $1`, [code]
    );
    const company = cResults.rows[0];

    if (!company) {
      throw new NotFoundError(`Invalid company code: ${code}`);
    }

    const iResults = await db.query(
      `SELECT id
      FROM invoices
      WHERE comp_code = $1
      ORDER BY id`, [code]
    );
    company.invoices = iResults.rows.map(i => i.id);

    return res.json({ company });
  });


/** POST / - create company from data;
 * expects JSON: {code, name, description}
 * return `{company: {code, name, description}}` */

router.post("/",
  async function (req, res) {
    console.log("req body:", req.body);
    if (req.body === undefined || Object.keys(req.body).length === 0) {
      throw new BadRequestError("Required info missing");
    }
    const { code, name, description } = req.body;

    const results = await db.query(
      `INSERT INTO companies (code, name, description)
      VALUES ($1, $2, $3)
      RETURNING code, name, description`,
      [code, name, description]
    );
    const company = results.rows[0];

    return res.status(201).json({ company });
  });


/** PUT /[code] - update fields in company;
 * expects JSON: {name, description}
 * return `{company: {code, name, description}}`
 */

router.put("/:code",
  async function (req, res) {
    if (req.body === undefined || "code" in req.body) {
      throw new BadRequestError("Not allowed"); //insufficient data
    }
    const { name, description } = req.body;
    const code = req.params.code;

    const results = await db.query(
      `UPDATE companies
      SET name=$1,
          description=$2
      WHERE code=$3
      RETURNING code, name, description`,
      [name, description, code]
    );

    const company = results.rows[0];
    if (!company) throw new NotFoundError(`No matching company: ${code}`);

    return res.json({ company });
  });


/** DELETE /[id] - delete company, return `{status: "deleted"}` */

router.delete("/:code",
  async function (req, res, next) {
    const code = req.params.code;
    console.log("code", code);

    const results = await db.query(
      `DELETE FROM companies
      WHERE code = $1
      RETURNING code`,
      [code]
    );
    const company = results.rows[0];

    if (!company) throw new NotFoundError(`No matching company: ${code}`);
    return res.json({ status: "deleted" });
  });


module.exports = router;