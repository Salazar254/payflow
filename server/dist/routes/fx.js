"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fx_1 = require("../controllers/fx");
const router = (0, express_1.Router)();
router.get('/rates', fx_1.getRates);
router.get('/quote', fx_1.getQuote); // Public or private? Let's make it public for landing page demo, or auth?
// Prompt says "Public Landing Page... Instant FX quotes". So public.
exports.default = router;
