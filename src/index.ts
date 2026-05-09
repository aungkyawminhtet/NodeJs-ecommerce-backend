require("dotenv").config();
import Express = require("express");
import type e = require('express');
import path = require("path");

const {defaultMigration, backupData} = require("./migrations/migrate");
const { DbConnect } = require('./utils/dbConnect');

const uploadFile = require('express-fileupload');

const user = require("./routes/userRoutes");
const permit = require("./routes/permitRoute");
const role = require("./routes/roleRoute");

const app = Express();

app.use(Express.json());
app.use(uploadFile());
app.use("/uploads", Express.static(path.join(__dirname, "../uploads")));

DbConnect();

app.use("/api/v1/users", user);
app.use("/api/v1/permits", permit);
app.use("/api/v1/roles", role);

//err handler
app.use((err: any,req: e.Request, res:e.Response, next: e.NextFunction) => {
    const status = err.status || 500;
    res.status(status).json({
        con: false,
        msg: err.message,
    });
});

const defaultData = async () => {
    // await defaultMigration();
    // await backupData();
    console.log("Default data migrated successfully");
}

defaultData();

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
