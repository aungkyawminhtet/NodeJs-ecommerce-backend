const { verifyToken, getCache } = require("../utils/helper");

const validateBody = (schema: any) => {
  return (req: any, res: any, next: any) => {
    let result = schema.validate(req.body);
    if (result.error) {
      return next(new Error(result.error.details[0].message));
    } else {
      next();
    }
  };
};

const validateParams = (schema: any, name: string) => {
  return (req: any, res: any, next: any) => {
    let obj = {
      [name]: req.params[name],
    };

    let result = schema.validate(obj);

    if (result.error) {
      return next(new Error(result.error.details[0].message));
    } else {
      next();
    }
  };
};

const validateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"].split(" ")[1];

  // console.log(authHeader);
  const decoded = verifyToken(authHeader);
  //   console.log(decoded._id);

  if (!decoded) {
    return next(new Error("Invalid token"));
  }

  let user = await getCache(decoded._id);

  //   console.log(user);

  if (!user) {
    return next(new Error("User not found"));
  }

  if (req.body) {
    req.body.user = user;
  }

  next();
};

const validateRole = (role: string) => {
  return (req: any, res: any, next: any) => {
    if (req.body.user.name.toLowerCase() === role) {
      console.log("Role validated successfully");
      next();
    } else {
      return next(new Error("Unauthorized access Role not found"));
    }
  };
};

module.exports = { validateBody, validateParams, validateToken, validateRole };
