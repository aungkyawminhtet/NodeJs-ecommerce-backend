require("dotenv").config();
import Express = require("express");
import type e = require("express");
import path = require("path");
import core = require('cors');

const {
  defaultMigration,
  addPermitRole,
  backupData,
  DefaultRolePermit,
} = require("./migrations/migrate");
const { DbConnect } = require("./utils/dbConnect");

const uploadFile = require("express-fileupload");

const user = require("./routes/userRoutes");
const permit = require("./routes/permitRoute");
const role = require("./routes/roleRoute");
const category = require("./routes/categoryRoute");

const app = Express();

app.use(Express.json());
app.use(core());
app.use(uploadFile());
app.use("/uploads", Express.static(path.join(__dirname, "../uploads")));

DbConnect();

app.use("/api/v1/users", user);
app.use("/api/v1/permits", permit);
app.use("/api/v1/roles", role);
app.use("/api/v1/categories", category);

//err handler
app.use((err: any, req: e.Request, res: e.Response, next: e.NextFunction) => {
  const status = err.status || 500;
  res.status(status).json({
    con: false,
    msg: err.message,
  });
});

const defaultData = async () => {
//   await defaultMigration();
  // await backupData();
  // await DefaultRolePermit();
  // await addPermitRole();
//   await addPermitRole();
  console.log("Default data migrated successfully");
};

defaultData();

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
