#!/usr/bin/env node
import { runCli } from "./cli.js";

runCli().catch((error) => {
  console.error(error);
  process.exit(1);
});
