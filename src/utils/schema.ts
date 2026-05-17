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

const categorySchema = {
  bodySchema: joi.object({
    name: joi.string().required(),
    image: joi.string().optional(),
    subCategory: joi
      .array()
      .items(joi.string().regex(/^[0-9a-fA-F]{24}$/))
      .optional(),
    user: joi.optional(),
  })
}

const subCategorySchema = {
  bodySchema: joi.object({
    name: joi.string().required(),
    image: joi.string().required(),
    categoryId: joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    childCategories: joi
      .array()
      .items(joi.string().regex(/^[0-9a-fA-F]{24}$/))
      .optional(),
    user: joi.optional(),
  }),
};

const deliverySchema = {
  bodySchema: joi.object({
    name: joi.string().required(),
    price: joi.number().required(),
    duration: joi.string().required(),
    image: joi.string().required(),
    remarks: joi.string().required(),
    user: joi.optional(),
  }),
};

const childCategorySchema = {
  bodySchema: joi.object({
    name: joi.string().required(),
    image: joi.string().required(),
    subCategoryId: joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    user: joi.optional(),
  }),
};

const tagSchema = {
  bodySchema: joi.object({
    name: joi.string().required(),
    image: joi.string().optional(),
    user: joi.optional(),
  }), 
}

const warrantySchema = {
  bodySchema: joi.object({
    name: joi.string().required(),
    image: joi.string(),
    remarks: joi.string().optional(),
    user: joi.optional(),
  }),
};

const productSchema = {
  bodySchema: joi.object({
    name: joi.string().required(),
    price: joi.number().required(),
    brand: joi.string().required(),
    category: joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    subCategory: joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    childCategory: joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    tag: joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    discount: joi.number().required(),
    features: joi.string().required(),
    description: joi.string().required(),
    details: joi.string().required(),
    status: joi.string().valid("available", "unavailable").required(),
    delivery: joi.string().required(),
    warranty: joi.string().required(),
    images: joi.string().required(),
    colors: joi.string().required(),
    sizes: joi.string().required(),
    rating: joi.number().min(0).max(5).required(),
    user: joi.optional(),
  })
}

const orderSchema = {
  bodySchema: joi.object({
    items: joi
      .array()
      .items(
        joi.object({
          productId: joi
            .string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required(),
          count: joi
            .number()
            .integer()
            .min(1)
            .required(),
        })
      ),
    status: joi
      .string()
      .valid("PENDING", "SHIPPED", "DELIVERED", "CANCELLED")
      .required(),
    user: joi.optional(),
  }),
}

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
  orderSchema,
  categorySchema,
  subCategorySchema,
  childCategorySchema,
  tagSchema,
  deliverySchema,
  warrantySchema,
  productSchema,
};
