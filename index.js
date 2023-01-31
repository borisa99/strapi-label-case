import delve from "dlv";
import dotenv from "dotenv";
import axios from "axios";

import { updateMetadatasLabel } from "./helpers.js";

dotenv.config();

try {
  if (!process.env.COLLECTION_TYPE_UID)
    throw new Error("COLLECTION_TYPE_UID env variable is required");

  const client = axios.create({
    baseURL: process.env.STRAPI_URL,
    headers: { "Content-Type": "application/json" },
  });

  // ------- Call a login endpoint -------
  // /configuration API is nto accessible with API Key
  const { data: loginData } = await client.post("/admin/login", {
    email: process.env.STRAPI_ADMIN_EMAIL,
    password: process.env.STRAPI_ADMIN_PASSWORD,
  });
  const token = delve(loginData, "data.token", null);
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ------- Get current configuration -------
  // Params:
  // uid - collection-type uid
  const uid = process.env.COLLECTION_TYPE_UID;
  const { data: configurationData } = await client.get(
    `/content-manager/content-types/${uid}/configuration`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // Update Content-Type metadata
  const configuration = delve(configurationData, "data.contentType", null);
  if (!configuration) throw new Error("Configuration not found");

  delete configuration.uid;
  configuration.metadatas = updateMetadatasLabel(configuration.metadatas);

  // Update child components metadata
  const updateComponentRequests = [];
  const components = delve(configurationData, "data.components", null);

  Object.keys(components).map((key) => {
    const component = components[key];
    updateComponentRequests.push(
      client.put(
        `/content-manager/components/${component.uid}/configuration`,
        {
          settings: component.settings,
          layouts: component.layouts,
          metadatas: updateMetadatasLabel(component.metadatas),
        },
        { headers }
      )
    );
  });

  // ------- Update Component configuration -------
  // Params: settings,layouts, metadatas
  await Promise.all(updateComponentRequests);

  // ------- Update Content-Type configuration -------
  // Params: settings,layouts, metadatas
  await client.put(
    `/content-manager/content-types/${uid}/configuration`,
    configuration,
    { headers }
  );
} catch (error) {
  console.log("🚀 ~ error", error.response.data.error);
  if (error.config) {
    const { baseURL, url, method } = error.config;
    console.log(error.message, method, baseURL + url);
  } else {
    console.log(error.message);
  }
  process.exit(1);
}
