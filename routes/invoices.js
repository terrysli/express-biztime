"use strict";

const express = require("express");
const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = express.Router();


/** GET / return {invoices: [{id, comp_code}, ...]} */

router.get("/",
  async function (req, res) {

    const results = await db.query(
      `SELECT id, comp_code
      FROM invoices
      ORDER BY id`);
    const invoices = results.rows;
    return res.json({ invoices });
  });


/** GET /[id] - return data about one invoice:
 * `{invoice: {id, amt, paid, add_date, paid_date, company: {
 *                              code, name, description}}` */

router.get("/:id",
  async function (req, res) {

    const id = Number(req.params.id);

    const iResults = await db.query(
      `SELECT id, amt, paid, add_date, paid_date, comp_code
      FROM invoices
      WHERE id = $1`, [id]);
    const invoice = iResults.rows[0];

    if (!invoice) {
      throw new NotFoundError(`No such invoice: ${id}`);
    }

    const compCode = invoice.comp_code;

    const cResults = await db.query(
      `SELECT code, name, description
      FROM companies
      WHERE code = $1`, [compCode]
    );
    const company = cResults.rows[0];

    invoice.company = company;
    delete invoice.comp_code;

    return res.json({ invoice });
  });


/** POST / - create invoice from data;
 * expects JSON: {comp_code, amt}
 * return `{invoice: {id, comp_code, amt, paid, add_date, paid_date}}` */

router.post("/",
  async function (req, res) {

    console.log("req body:", req.body);

    if (req.body === undefined || Object.keys(req.body).length === 0) {
      throw new BadRequestError("Required info missing");
    }
    const { comp_code, amt } = req.body;

    const results = await db.query(
      `INSERT INTO invoices (comp_code, amt)
      VALUES ($1, $2)
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );
    const invoice = results.rows[0];

    return res.status(201).json({ invoice });
  });


/** PUT /[id] - update fields in invoice;
* expects JSON: {amt}
* return `{invoice: {id, comp_code, amt, paid, add_date, paid_date}}`
*/

router.put("/:id",
  async function (req, res) {

    const id = Number(req.params.id);

    if (req.body === undefined) {
      throw new BadRequestError("Insufficient data");
    }
    const { amt } = req.body;

    const results = await db.query(
      `UPDATE invoices
      SET amt=$1
      WHERE id=$2
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, id]
    );

    const invoice = results.rows[0];
    if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);

    return res.json({ invoice });
  });


/** DELETE /[id] - delete invoice, return `{status: "deleted"}` */

router.delete("/:id",
  async function (req, res) {

    const id = Number(req.params.id);

    const results = await db.query(
      `DELETE FROM invoices
      WHERE id = $1
      RETURNING id`,
      [id]
    );
    const invoice = results.rows[0];

    if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);
    return res.json({ status: "deleted" });
  });




module.exports = router;