"use strict";

const express = require("express");
const db = require("../db");
const { BadRequestError } = require("../expressError");

const router = express.Router();

/** GET / => {companies: [{code, name}, ...]} */

router.get("", async function (req, res) {
  const results = await db.query(
    `SELECT code, name
      FROM companies`);
  const companies = results.rows;
  return res.json({ companies });
});


module.exports = router;