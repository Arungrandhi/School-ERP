import mongoose from "mongoose";

const tenantConnections = {};

export const getTenantDB = async (dbName) => {
  try {
    if (tenantConnections[dbName]) {
      return tenantConnections[dbName];
    }

    const uri = `${process.env.MONGO_BASE_URI}/${dbName}`;

    const connection = await mongoose.createConnection(uri).asPromise();

    tenantConnections[dbName] = connection;

    console.log(`🏫 Tenant DB connected → ${dbName}`);

    return connection;
  } catch (error) {
    console.error("❌ Tenant DB error:", error.message);
    throw error;
  }
};
