const fs = require("fs");
const { encode } = require("../utils/helper");
const Db = require("../models/user");
const roleDb = require("../models/role");
const permitDb = require("../models/permit");

const defaultMigration = () => {
  let data = fs.readFileSync("./src/migrations/users.json", "utf-8");
  let jsonData = JSON.parse(data);

  jsonData.forEach(async (user: any) => {
    let check = await Db.findOne({ email: user.email });

    if (check) {
      // console.log("User already exists", user.email);
      return;
    }
    let encodedPass = encode(user.password);
    user.password = encodedPass;
    // new Db(user).save();
    await new Db(user).save();
    console.log("User saved successfully");
  });
};

const DefaultRolePermit = async () => {
  let data = fs.readFileSync("./src/migrations/rolePermit.json", "utf-8");
  let jsonData = JSON.parse(data);

  console.log(jsonData);

  jsonData.roles.forEach(async (roleData: any) => {
    let role = await new roleDb(roleData).save();
  });

  jsonData.permits.forEach(async (permitData: any) => {
    let permit = await new permitDb(permitData).save();
  });
  console.log("Role and permit added successfully");
};

const addPermitRole = async () => {
  let data = fs.readFileSync("./src/migrations/rolePermit.json", "utf-8");
  let jsonData = JSON.parse(data);

  // console.log(jsonData.roles);

  for (let role of jsonData.roles) {
    let checkuser = await Db.findOne({ name: role.name });

    let checkRole = await roleDb.findOne({ name: role.name });
    // console.log(singleRole);
    if (checkRole && checkuser) {
      await Db.findByIdAndUpdate(checkuser._id, { $push: { roles: checkRole._id } });
    }
  }
  console.log("Role and permit added successfully");
};

const backupData = async () => {
  let users = await Db.find();
  fs.writeFileSync("./src/migrations/backup/data.json", JSON.stringify(users));

  console.log("Data backup completed successfully");
};

module.exports = {
  defaultMigration,
  backupData,
  DefaultRolePermit,
  addPermitRole,
};
