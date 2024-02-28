const express = require("express");
const auth = require("../middlewares/auth")
const {createContentByType , getContentByType} = require("../Controllers/EducationalController");
const educationalRouter = express.Router();


educationalRouter.post("/createcontent" , auth ,createContentByType);
educationalRouter.get("/" ,auth , getContentByType);

module.exports = educationalRouter;
