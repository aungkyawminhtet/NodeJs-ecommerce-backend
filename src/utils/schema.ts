const joi = require("joi");

const permitSchema = {
  bodySchema: joi.object({
    name: joi.string().required(),
  }),
};

const roleSchema = {
  bodySchema: joi.object({
    name: joi.string().required(),
    permits: joi
      .array()
      .items(joi.string().regex(/^[0-9a-fA-F]{24}$/))
      .required()
      .optional(),
    user: joi.optional(),
  }),

  addPermitSchema: joi.object({
    roleId: joi
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
    permitId: joi
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
  }),
};

const userSchema = {
  bodySchema: joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    phone: joi.string().min(10).max(15).required(),
    password: joi.string().min(6).required(),
  }),

  addRoleSchema: joi.object({
    userId: joi
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
    roleId: joi
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
    user: joi.optional(),
  }),

  addPermitSchema: joi.object({
    userId: joi
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
    permitId: joi
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
    user: joi.optional(),
  }),
};

const loginSchema = {
  bodySchema: joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(3).required(),
  }),
};

const idSchema = joi.object({
  id: joi.string().regex(/^[0-9a-fA-F]{24}$/),
});

module.exports = {
  permitSchema,
  roleSchema,
  userSchema,
  loginSchema,
  idSchema,
};
