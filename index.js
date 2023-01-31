import delve from "dlv";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

try {
  if (!process.env.COLLECTION_TYPE_UID)
    throw new Error("COLLECTION_TYPE_UID env variable is required");

  const client = axios.create({
    baseURL: process.env.STRAPI_URL,
    headers: { "Content-Type": "application/json" },
  });

  const toLabelCase = (str) =>
    str
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase().trim());

  const isObjectEmpty = (objectName) => Object.keys(objectName).length === 0;

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
  const uid = process.env.COLLECTION_TYPE_UID;
  const { data: configurationData } = await client.get(
    `/content-manager/content-types/${uid}/configuration`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const configuration = delve(configurationData, "data.contentType", null);
  if (!configuration) throw new Error("Configuration not found");

  // Required formatting for PUT request
  delete configuration.uid;

  Object.keys(configuration.metadatas).map((key) => {
    const field = Object.assign({}, configuration.metadatas[key]);
    delete field.edit.mainField;
    delete field.list.mainField;

    if (!isObjectEmpty(field.edit)) {
      field.edit = { ...field.edit, label: toLabelCase(field.edit.label) };
    }
    if (!isObjectEmpty(field.list)) {
      field.list = { ...field.list, label: toLabelCase(field.list.label) };
    }
    configuration.metadatas[key] = field;
  });

  // Update configuration
  // Params:layouts, metadatas, components
  await client.put(
    `/content-manager/content-types/${uid}/configuration`,
    configuration,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
} catch (error) {
  if (error.config) {
    const { baseURL, url, method } = error.config;
    console.log(error.message, method, baseURL + url);
  } else {
    console.log(error.message);
  }
  process.exit(1);
}
