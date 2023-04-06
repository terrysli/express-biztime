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
  if (Object.keys(req.body).length === 0) {
    throw new BadRequestError("Required info missing");
  }
  const { code, name, description } = req.body;

  const result = await db.query(
    `INSERT INTO companies (code, name, description)
      VALUES ($1, $2, $3)
      RETURNING code, name, description`,
    [code, name, description]
  );
  const company = result.rows[0];

  return res.status(201).json({ company });
});

module.exports = router;