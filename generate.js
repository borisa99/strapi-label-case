import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

import client, { authenticate } from "./client.js";

/*
 Legend:
    ct - Content-Types
    co - Components
*/

try {
  await authenticate();

  // ----- Content-Types -----
  const { data: ctData } = await client.get("/content-manager/content-types");
  const ctPromises = [];
  ctData.data.map(({ uid }) => {
    ctPromises.push(
      client.get(`/content-manager/content-types/${uid}/configuration`)
    );
  });
  await Promise.all(ctPromises)
    .then(
      async (values) =>
        await fs.writeFileSync(
          "generated/content-types.json",
          JSON.stringify(values.map((res) => res.data.data.contentType))
        )
    )
    .catch((err) => {
      throw err;
    });

  // ----- Components -----
  const { data: coData } = await client.get("/content-manager/components");
  const coPromises = [];
  coData.data.map(({ uid }) => {
    coPromises.push(
      client.get(`/content-manager/components/${uid}/configuration`)
    );
  });

  await Promise.all(coPromises)
    .then(
      async (values) =>
        await fs.writeFileSync(
          "generated/components.json",
          JSON.stringify(values.map((res) => res.data.data.component))
        )
    )
    .catch((err) => {
      throw err;
    });
} catch (error) {
  console.log(error.message);
  process.exit(1);
}
