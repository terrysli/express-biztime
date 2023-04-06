"use strict";

const express = require("express");
const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = express.Router();

/** GET / returns {companies: [{code, name}, ...]} */

router.get("/",
async function (req, res) {
  const results = await db.query(
    `SELECT code, name
      FROM companies`);
  const companies = results.rows;
  return res.json({ companies });
});


/** GET /[code] - returns data about one company:
 * {company: {code, name, description}} */

router.get("/:code",
async function (req, res) {
  const code = req.params.code;

  const results = await db.query(
    `SELECT code, name, description
      FROM companies
      WHERE code = $1`, [code]);

  if (results.rows.length === 0) {
    throw new NotFoundError("Invalid company code");
  }

  const company = results.rows[0];

  return res.json({ company });
});


/** POST / - create company from data;
 * return {company: {code, name, description}} */

router.post("/",
async function (req, res) {
  console.log("req body:",req.body);
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
 * return {company: {code, name, description}}
 */

router.put("/:code",
async function (req, res) {
  if (req.body === undefined || "code" in req.body) {
    throw new BadRequestError("Not allowed");
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
  )
  const company = results.rows[0];
  if (!company) throw new NotFoundError(`No matching company: ${code}`);

  return res.json({ company });
});


module.exports = router;