# Logging Middleware

Reusable logging package for AffordMed assessment.

Usage:

const Log = require("./logger");

await Log(
 "backend",
 "info",
 "service",
 "Application Started",
 token
);