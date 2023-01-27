import delve from "dlv";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const client = axios.create({
  baseURL: process.env.STRAPI_URL,
  headers: { "Content-Type": "application/json" },
});

// Call a login endpoint
// /configuration API is nto accessible with API Key
const { data: loginData } = await client.post("/admin/login", {
  email: process.env.STRAPI_ADMIN_EMAIL,
  password: process.env.STRAPI_ADMIN_PASSWORD,
});
const token = delve(loginData, "data.token", null);

// Get current configuration
// Params:
// uid - collection-type uid
const uid = "api::page.page"; // TEMP
const { data: configurationData } = await client.get(
  `/content-manager/content-types/${uid}/configuration`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

const configuration = delve(configurationData, "data.contentType", null);
if (configuration) {
  delete configuration.uid;
  delete configuration.metadatas.tags.list.mainField;
  delete configuration.metadatas.author.list.mainField;
}

// Update configuration
// Params:layouts, metadatas, components
const response = await client.put(
  `/content-manager/content-types/${uid}/configuration`,
  configuration,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

console.log(response.data);
