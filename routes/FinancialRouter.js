const express = require("express");
const { getFinancial , createupdateFinancial} = require("../Controllers/FinancialController");
const auth = require("../middlewares/auth");
const FinancialRouter = express.Router();

FinancialRouter.post("/createupdate",auth, createupdateFinancial);
FinancialRouter.get("/" ,auth, getFinancial);


module.exports = FinancialRouter;