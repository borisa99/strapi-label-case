import dotenv from "dotenv";
dotenv.config();

import { authenticate } from "./client.js";
import { generatePromises } from "./helpers.js";
import contentTypes from "./generated/content-types.json" assert { type: "json" };
import components from "./generated/components.json" assert { type: "json" };

/*
 Legend:
    ct - Content-Types
    co - Components
*/

try {
  await authenticate();

  // ------- Components -------
  const updateCtPromises = await generatePromises(
    "content-types",
    contentTypes
  );
  await Promise.all(updateCtPromises);

  // ------- Components -------
  const updateCoPromises = await generatePromises("components", components);
  await Promise.all(updateCoPromises);
} catch (error) {
  console.log(error.message);
  process.exit(1);
}
