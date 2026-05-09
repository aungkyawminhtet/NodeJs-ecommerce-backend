const mongoose = require("mongoose");

const DbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB);
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Error " + error);
  }
};

module.exports = { DbConnect };
