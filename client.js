import delve from "dlv";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const client = axios.create({
  baseURL: process.env.STRAPI_URL,
  headers: { "Content-Type": "application/json" },
});

export const authenticate = async () => {
  try {
    // ------- Call a login endpoint -------
    // /configuration API is nto accessible with API Key
    const { data: loginData } = await client.post("/admin/login", {
      email: process.env.STRAPI_ADMIN_EMAIL,
      password: process.env.STRAPI_ADMIN_PASSWORD,
    });

    const token = delve(loginData, "data.token", null);
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } catch (error) {
    throw error;
  }
};

export default client;
