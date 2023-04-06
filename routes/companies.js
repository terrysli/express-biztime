"use strict";

const express = require("express");
const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = express.Router();

/** GET / => {companies: [{code, name}, ...]} */

router.get("",
async function (req, res) {
  const results = await db.query(
    `SELECT code, name
      FROM companies`);
  const companies = results.rows;
  return res.json({ companies });
});


/** GET /[code] => {company: {code, name, description}} */

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

module.exports = router;