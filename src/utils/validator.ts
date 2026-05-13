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
  const token = req.headers["authorization"];

  if (!token) {
    return next(new Error("Token not provided"));
  }
  const authHeader = token.split(" ")[1];
  if (!authHeader) {
    return next(new Error("Token not provided"));
  }
  const decoded = verifyToken(authHeader);

  let user = await getCache(decoded._id);

  if (!user) {
    return next(new Error("User not found"));
  }

  req.user = user;

  next();
};

const validateRole = (role: string) => {
  return (req: any, res: any, next: any) => {
    if (req.user.name.toLowerCase() === role) {
      // console.log("Role validated successfully");
      next();
    } else {
      return next(new Error("Unauthorized access!"));
    }
  };
};

const hasAnyRole = (roles: string[]) => {
  console.log("hasAnyRole", roles);
  return (req: any, res: any, next: any) => {
    let hasRole = false;
    for (let i = 0; i < roles.length; i++) {
      if (req.user.name.toLowerCase() === roles[i]) {
        hasRole = true;
        break;
      }
    }
    if (!hasRole) {
      return next(new Error("Unauthorized access!"));
    }
    next();
  };
};

const validatePermit = (permit: string) => {
  return (req: any, res: any, next: any) => {
    if (req.user.name.toLowerCase() === permit) {
      // console.log("Permit validated successfully");
      next();
    } else {
      return next(new Error("Unauthorized access Permit!"));
    }
  }
}

const hasAnyPermit = (permits: string[]) => {
  return (req: any, res: any, next: any) => {
    let hasPermit = false;
    for (let i = 0; i < permits.length; i++) {
      if (req.user.name.toLowerCase() === permits[i]) {
        hasPermit = true;
        break;
      }
    }
    if (!hasPermit) {
      return next(new Error("Unauthorized access Permit!"));
    }
    next();
  };
};

module.exports = {
  validateBody,
  validateParams,
  validateToken,
  validateRole,
  hasAnyRole,
  validatePermit,
  hasAnyPermit,
};
