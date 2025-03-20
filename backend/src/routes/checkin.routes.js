const express = require("express");
const router = express.Router();
const { deleteCheckin } = require("../controllers/habitController");

const { protect } = require("../middleware/auth");

// All routes below this middleware are protected
router.use(protect);

// Routes
router.route("/:id").delete(deleteCheckin);

module.exports = router;
