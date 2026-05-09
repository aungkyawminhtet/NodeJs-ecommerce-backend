const fs = require("fs");
const { encode } = require("../utils/helper");
const Db = require("../models/user");

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
  });
};

const backupData = async () => {
  let users = await Db.find();
  fs.writeFileSync("./src/migrations/backup/data.json", JSON.stringify(users));

  console.log("Data backup completed successfully");
}

module.exports = {defaultMigration, backupData};
