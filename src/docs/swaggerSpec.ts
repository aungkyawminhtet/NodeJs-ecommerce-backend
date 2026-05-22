const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "E-Commerce Backend API Portal",
    version: "1.0.0",
    description: "Highly optimized, production-grade REST API backend supporting JWT token rotation, Redis caching, Stripe integration, Resend email dispatching, robust address book management, role management, and product listings.",
    contact: {
      name: "API Support Team",
      email: "support@yourdomain.com",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local Development Server",
    },
    {
      url: "https://api.staging.yourdomain.com",
      description: "Staging Sandbox Server",
    },
    {
      url: "https://api.yourdomain.com",
      description: "Production API Gate",
    },
  ],
  security: [
    {
      BearerAuth: [],
    },
  ],
  tags: [
    { name: "Authentication & Security", description: "Endpoints securing registration, user sessions, OTP verification, and recovery" },
    { name: "User Accounts", description: "Direct profile and administrative user properties, roles, and permits mapping" },
    { name: "Permits", description: "Granular access permission tokens for fine-grained authorization" },
    { name: "Roles", description: "User roles defining system capabilities and permission scopes" },
    { name: "Categories", description: "Main inventory categories (admin only for mutations)" },
    { name: "Subcategories", description: "Sub-level catalog category classifications" },
    { name: "Child Categories", description: "Deepest level hierarchical category groupings" },
    { name: "Tags", description: "Dynamic metadata tags for product categorization and discovery" },
    { name: "Deliveries", description: "Logistics and shipping duration/pricing configs" },
    { name: "Warranties", description: "Warranty packages and item coverage configs" },
    { name: "Products", description: "Store catalog CRUD, pagination, and dynamic filters" },
    { name: "Cart", description: "Active user shopping basket session controls" },
    { name: "Orders", description: "Order processing, history ledger, and shipping tracker" },
    { name: "Payments", description: "Stripe checkout session handlers, transaction history, and webhook events" },
    { name: "Addresses", description: "Shipping address books, setting default shipping location, and standard address CRUD" },
  ],
  paths: {
    "/api/v1/users/register": {
      post: {
        tags: ["Authentication & Security"],
        summary: "User Signup Registration",
        description: "Creates a new user profile, pre-hashes the password, assigns default guest privileges, generates a validation token, and dispatches a welcome verification email asynchronously.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserRegister",
              },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "User created successfully. Please check your email to verify your account." },
                    data: { $ref: "#/components/schemas/UserResponse" },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation failure or Email/Phone collision",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/login": {
      post: {
        tags: ["Authentication & Security"],
        summary: "Secure User Login Portal",
        description: "Validates credentials, builds short-lived JSON Web Tokens (JWT) paired with 7-day secure HTTP-Only refresh cookies, registers user state to active Redis session caches, and returns user profile metadata.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserLogin",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Successfully authenticated",
            headers: {
              "Set-Cookie": {
                schema: {
                  type: "string",
                  example: "refreshToken=eyJhbGci...; Path=/; HttpOnly; Secure; SameSite=Strict",
                },
                description: "HTTP-Only session refresh token cookie valid for 7 days.",
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "User logged in successfully" },
                    data: {
                      allOf: [
                        { $ref: "#/components/schemas/UserResponse" },
                        {
                          type: "object",
                          properties: {
                            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid email structure or incorrect password",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/users": {
      get: {
        tags: ["User Accounts"],
        summary: "List All Users",
        description: "Fetch all registered users in the database.",
        responses: {
          200: {
            description: "Array of registered users retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Users successfully fetched" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/UserResponse" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/add/role": {
      post: {
        tags: ["User Accounts"],
        summary: "Assign Role to User",
        description: "Adds a specific role (e.g. admin, supervisor) to the designated user ID. Restricted to owners only.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId", "roleId"],
                properties: {
                  userId: { type: "string", pattern: "^[0-9a-fA-F]{24}$", example: "664d9be7f111c12d40179c96" },
                  roleId: { type: "string", pattern: "^[0-9a-fA-F]{24}$", example: "664d9be7f111c12d40179a99" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Role successfully assigned",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Role assigned successfully" },
                    data: { $ref: "#/components/schemas/UserResponse" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/remove/role": {
      post: {
        tags: ["User Accounts"],
        summary: "Strip Role from User",
        description: "Deletes a specific role assignment from a user ID. Restricted to owners only.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId", "roleId"],
                properties: {
                  userId: { type: "string", pattern: "^[0-9a-fA-F]{24}$", example: "664d9be7f111c12d40179c96" },
                  roleId: { type: "string", pattern: "^[0-9a-fA-F]{24}$", example: "664d9be7f111c12d40179a99" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Role successfully stripped",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Role removed successfully" },
                    data: { $ref: "#/components/schemas/UserResponse" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/add/permit": {
      post: {
        tags: ["User Accounts"],
        summary: "Grant Direct Permission to User",
        description: "Adds a specific granular permission to a user. Restricted to owners only.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId", "permitId"],
                properties: {
                  userId: { type: "string", pattern: "^[0-9a-fA-F]{24}$", example: "664d9be7f111c12d40179c96" },
                  permitId: { type: "string", pattern: "^[0-9a-fA-F]{24}$", example: "664d9be7f111c12d40179a02" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Permission successfully granted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Permission added successfully" },
                    data: { $ref: "#/components/schemas/UserResponse" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/remove/permit": {
      post: {
        tags: ["User Accounts"],
        summary: "Revoke Direct Permission from User",
        description: "Removes a direct permission assignment from a user ID. Restricted to owners only.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId", "permitId"],
                properties: {
                  userId: { type: "string", pattern: "^[0-9a-fA-F]{24}$", example: "664d9be7f111c12d40179c96" },
                  permitId: { type: "string", pattern: "^[0-9a-fA-F]{24}$", example: "664d9be7f111c12d40179a02" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Permission successfully revoked",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Permission revoked successfully" },
                    data: { $ref: "#/components/schemas/UserResponse" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/refresh-token": {
      post: {
        tags: ["Authentication & Security"],
        summary: "Automatic JWT Session Rotation",
        description: "Acquires the refresh token from secure HttpOnly cookies or the JSON request body, validates it against active Redis session locks to prevent replay attacks, rotates both token pairs, and updates browser cookies.",
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  refreshToken: { type: "string", description: "Optional backup refresh token parameter if cookies are disabled." },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Tokens successfully rotated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Token rotated successfully" },
                    data: {
                      type: "object",
                      properties: {
                        accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Token is invalid, expired, or session was rotated previously",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/logout": {
      post: {
        tags: ["Authentication & Security"],
        summary: "Logout & Terminate Session",
        description: "Clears the HttpOnly `refreshToken` cookie from the client and invalidates active session states inside the Redis cache database.",
        responses: {
          200: {
            description: "Session successfully destroyed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Logged out successfully" },
                    data: { type: "object", nullable: true, example: null },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/forgot-password": {
      post: {
        tags: ["Authentication & Security"],
        summary: "Request Password Recovery",
        description: "Verifies the target user email address, generates a unique timed recovery token (valid for 1 hour), commits the hash to MongoDB, and dispatches a password recovery verification link.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string", format: "email", example: "customer@example.com" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Recovery email successfully sent",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Password reset link sent to your email" },
                    data: { type: "object", nullable: true, example: null },
                  },
                },
              },
            },
          },
          400: {
            description: "No registered user found with the provided email",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/reset-password": {
      post: {
        tags: ["Authentication & Security"],
        summary: "Complete Password Recovery Flow",
        description: "Validates the recovery token against active MongoDB records, checks token expiration parameters, hashes the new password, updates the user credentials, and invalidates the single-use token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token", "newPassword"],
                properties: {
                  token: { type: "string", example: "a3f5b2..." },
                  newPassword: { type: "string", minimum: 6, example: "newSecurePassword123" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Password reset successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Password reset successfully" },
                    data: { type: "object", nullable: true, example: null },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid/expired token or password validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/verify-email": {
      get: {
        tags: ["Authentication & Security"],
        summary: "Verify Account via Email Link (GET)",
        description: "Validates account registration using the verification token sent via email.",
        parameters: [
          {
            name: "token",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Cryptographic email verification token.",
          },
        ],
        responses: {
          200: {
            description: "Account successfully activated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Email verified successfully" },
                    data: { type: "object", nullable: true, example: null },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid or expired token link",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Authentication & Security"],
        summary: "Verify Account via App Client (POST)",
        description: "Validates account registration using the verification token passed inside the JSON request body.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token"],
                properties: {
                  token: { type: "string", example: "c7f9a1b2..." },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Account successfully activated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Email verified successfully" },
                    data: { type: "object", nullable: true, example: null },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid or expired verification token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/permits": {
      get: {
        tags: ["Permits"],
        summary: "List All Granular Permits",
        description: "Fetches an array of all active access permission keys available in the database.",
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "All Permits" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/PermitResponse" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Permits"],
        summary: "Create New Permission Permit",
        description: "Inserts a new granular authorization permit name into the system records.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PermitCreate" },
            },
          },
        },
        responses: {
          201: {
            description: "Created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Permit created successfully" },
                    data: { $ref: "#/components/schemas/PermitResponse" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/permits/{id}": {
      get: {
        tags: ["Permits"],
        summary: "Fetch Permit Details",
        description: "Retrieves a specific permit's details by its unique MongoDB ObjectID.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Single Permit" },
                    data: { $ref: "#/components/schemas/PermitResponse" },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Permits"],
        summary: "Update Permit Name",
        description: "Modifies standard naming keys of an active permit index.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PermitCreate" },
            },
          },
        },
        responses: {
          200: {
            description: "Updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Permit updated successfully" },
                    data: { $ref: "#/components/schemas/PermitResponse" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Permits"],
        summary: "Destroy Active Permit",
        description: "Permanently purges a permit from the database records.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Purged successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Permit deleted successfully" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/roles": {
      get: {
        tags: ["Roles"],
        summary: "List Active Roles",
        description: "Fetch all roles. Requires admin, owner, or supervisor token authentication.",
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "All Roles" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/RoleResponse" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Roles"],
        summary: "Create New Role Descriptor",
        description: "Registers a new system role along with starting permitted permissions.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RoleCreate" },
            },
          },
        },
        responses: {
          201: {
            description: "Created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Role created successfully" },
                    data: { $ref: "#/components/schemas/RoleResponse" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/roles/add/permit": {
      post: {
        tags: ["Roles"],
        summary: "Attach Permit to Role",
        description: "Binds an authorization permit to a target user role.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RoleAddPermit" },
            },
          },
        },
        responses: {
          200: {
            description: "Successfully mapped",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Permit successfully attached to role" },
                    data: { $ref: "#/components/schemas/RoleResponse" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/roles/remove/permit": {
      post: {
        tags: ["Roles"],
        summary: "Strip Permit from Role",
        description: "Removes an active authorization permit from a target role.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RoleAddPermit" },
            },
          },
        },
        responses: {
          200: {
            description: "Successfully unmapped",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Permit successfully stripped from role" },
                    data: { $ref: "#/components/schemas/RoleResponse" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/roles/{id}": {
      get: {
        tags: ["Roles"],
        summary: "Get Role Details",
        description: "Fetch a single role detail mapping by ObjectID.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Single Role fetched" },
                    data: { $ref: "#/components/schemas/RoleResponse" },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Roles"],
        summary: "Update Role Info",
        description: "Modifies role parameters.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RoleCreate" },
            },
          },
        },
        responses: {
          200: {
            description: "Updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Role updated successfully" },
                    data: { $ref: "#/components/schemas/RoleResponse" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Roles"],
        summary: "Delete Role Profile",
        description: "Purges the target role index completely.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Purged successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Role deleted successfully" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/categories": {
      get: {
        tags: ["Categories"],
        summary: "List Store Categories",
        description: "Public directory listing all active stock category classes.",
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "All Categories" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/CategoryResponse" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Categories"],
        summary: "Create New Stock Category",
        description: "Adds a main index category into catalog. Expects multipart/form-data for image uploads. Admin only.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["name", "file"],
                properties: {
                  name: { type: "string", description: "Name of Category", example: "Electronics" },
                  file: { type: "string", format: "binary", description: "Category cover image file upload" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Category created successfully" },
                    data: { $ref: "#/components/schemas/CategoryResponse" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/categories/{id}": {
      get: {
        tags: ["Categories"],
        summary: "Get Category Profile",
        description: "Fetches category specifications and mapping list.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Single category fetched" },
                    data: { $ref: "#/components/schemas/CategoryResponse" },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Categories"],
        summary: "Update Category Values",
        description: "Allows renaming category details and optional image update. Expects multipart/form-data. Admin only.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Electronics & Smart Tech" },
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Category updated successfully" },
                    data: { $ref: "#/components/schemas/CategoryResponse" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Categories"],
        summary: "Purge Stock Category",
        description: "Purges category indexing records. Admin only.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Purged successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Category deleted successfully" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/subcategories": {
      get: {
        tags: ["Subcategories"],
        summary: "List Store Subcategories",
        description: "Retrieves an array of all active subcategory divisions.",
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "All Subcategories" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/SubCategoryResponse" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Subcategories"],
        summary: "Create New Subcategory",
        description: "Adds a new subcategory connected to a primary category ID. Multipart form-data expected. Admin only.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["name", "categoryId", "file"],
                properties: {
                  name: { type: "string", example: "Mobile Phones" },
                  categoryId: { type: "string", pattern: "^[0-9a-fA-F]{24}$", example: "664d9be7f111c12d40179a01" },
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Subcategory created successfully" },
                    data: { $ref: "#/components/schemas/SubCategoryResponse" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/subcategories/{id}": {
      get: {
        tags: ["Subcategories"],
        summary: "Get Subcategory Profile",
        description: "Fetches subcategory values.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Single Subcategory fetched" },
                    data: { $ref: "#/components/schemas/SubCategoryResponse" },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Subcategories"],
        summary: "Update Subcategory Info",
        description: "Allows reconfiguring subcategory references and uploads. Admin only.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Smartphones & Mobile Devices" },
                  categoryId: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Subcategory updated successfully" },
                    data: { $ref: "#/components/schemas/SubCategoryResponse" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Subcategories"],
        summary: "Purge Subcategory Item",
        description: "Deletes a subcategory from indexing files. Admin only.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Purged successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Subcategory deleted successfully" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/childcategories": {
      get: {
        tags: ["Child Categories"],
        summary: "List Deep Child Categories",
        description: "Returns all child-level categories inside product catalog mapping.",
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "All Child Categories" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ChildCategoryResponse" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Child Categories"],
        summary: "Create New Child Category",
        description: "Creates child category under a designated subcategory ID. Multipart file upload expected. Admin only.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["name", "subCategoryId", "file"],
                properties: {
                  name: { type: "string", example: "iOS Smartphones" },
                  subCategoryId: { type: "string", pattern: "^[0-9a-fA-F]{24}$", example: "664d9be7f111c12d40179b02" },
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Child Category created successfully" },
                    data: { $ref: "#/components/schemas/ChildCategoryResponse" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/childcategories/{id}": {
      get: {
        tags: ["Child Categories"],
        summary: "Get Child Category Info",
        description: "Fetches catalog configuration value.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Single Child category fetched" },
                    data: { $ref: "#/components/schemas/ChildCategoryResponse" },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Child Categories"],
        summary: "Update Child Category Info",
        description: "Updates parameters. Admin only.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Apple iPhones" },
                  subCategoryId: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Child Category updated successfully" },
                    data: { $ref: "#/components/schemas/ChildCategoryResponse" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Child Categories"],
        summary: "Purge Child Category",
        description: "Deletes item completely. Admin only.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Purged successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Child Category deleted successfully" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/tags": {
      get: {
        tags: ["Tags"],
        summary: "List Stock Metadata Tags",
        description: "Fetch dynamic tagging models.",
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "All Tags" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/TagResponse" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Tags"],
        summary: "Create New Metadata Tag",
        description: "Inserts dynamic catalog search tags. Multipart file uploads expected. Admin only.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["name", "file"],
                properties: {
                  name: { type: "string", example: "Summer Sale" },
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Tag created successfully" },
                    data: { $ref: "#/components/schemas/TagResponse" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/tags/{id}": {
      get: {
        tags: ["Tags"],
        summary: "Get Tag Details",
        description: "Fetches dynamic tag indices.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Single Tag fetched" },
                    data: { $ref: "#/components/schemas/TagResponse" },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Tags"],
        summary: "Update Tag Information",
        description: "Edits parameters. Admin only.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Mid-Year Blowout" },
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Tag updated successfully" },
                    data: { $ref: "#/components/schemas/TagResponse" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Tags"],
        summary: "Purge Tag Index",
        description: "Deletes tag indexing files. Admin only.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Purged successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Tag deleted successfully" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/deliveries": {
      get: {
        tags: ["Deliveries"],
        summary: "List Delivery Options",
        description: "Fetch configured logistics shipping options.",
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "All Deliveries" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/DeliveryResponse" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Deliveries"],
        summary: "Create Logistics Shipping Package",
        description: "Inserts logistics delivery setups. Expects multipart/form-data. Admin only.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["name", "price", "duration", "remarks", "file"],
                properties: {
                  name: { type: "string", example: "Express Shipping" },
                  price: { type: "number", example: 4.99 },
                  duration: { type: "string", example: "1-2 Business Days" },
                  remarks: { type: "string", example: "Fastest standard home delivery option" },
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Delivery created successfully" },
                    data: { $ref: "#/components/schemas/DeliveryResponse" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/deliveries/{id}": {
      get: {
        tags: ["Deliveries"],
        summary: "Get Delivery Details",
        description: "Fetch delivery details.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Single Delivery fetched" },
                    data: { $ref: "#/components/schemas/DeliveryResponse" },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Deliveries"],
        summary: "Update Delivery Info",
        description: "Edits parameters. Admin only.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Super Express Overnight" },
                  price: { type: "number", example: 9.99 },
                  duration: { type: "string", example: "Next Business Day" },
                  remarks: { type: "string", example: "Orders before 2PM processed immediately" },
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Delivery updated successfully" },
                    data: { $ref: "#/components/schemas/DeliveryResponse" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Deliveries"],
        summary: "Purge Delivery Setup",
        description: "Deletes setup profile. Admin only.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Purged successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Delivery deleted successfully" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/warranties": {
      get: {
        tags: ["Warranties"],
        summary: "List Warranty Packages",
        description: "Fetch warranty coverage scopes.",
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "All Warranties" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/WarrantyResponse" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Warranties"],
        summary: "Create Warranty Package",
        description: "Inserts custom warranty scopes. Multipart image upload expected. Admin only.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["name", "remarks", "file"],
                properties: {
                  name: { type: "string", example: "2 Year AppleCare Coverage" },
                  remarks: { type: "string", example: "Covers standard manufacturing damages and screen cracks" },
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Warranty created successfully" },
                    data: { $ref: "#/components/schemas/WarrantyResponse" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/warranties/{id}": {
      get: {
        tags: ["Warranties"],
        summary: "Get Warranty details",
        description: "Fetch warranty detail values.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Single Warranty fetched" },
                    data: { $ref: "#/components/schemas/WarrantyResponse" },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Warranties"],
        summary: "Update Warranty values",
        description: "Edits parameters. Admin only.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "AppleCare Extended" },
                  remarks: { type: "string", example: "Extends initial warranty limits by 1 additional year" },
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Warranty updated successfully" },
                    data: { $ref: "#/components/schemas/WarrantyResponse" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Warranties"],
        summary: "Purge Warranty Setup",
        description: "Deletes item completely. Admin only.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Purged successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Warranty deleted successfully" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/products": {
      get: {
        tags: ["Products"],
        summary: "List Store Catalog",
        description: "Returns the complete active product inventory catalog. Requires user login token authentication.",
        responses: {
          200: {
            description: "Product list returned",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "All products" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ProductResponse" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create New Product",
        description: "Publishes a new product item in the inventory catalog. Requires multipart/form-data supporting multi-file image uploads. Admin only.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["name", "price", "brand", "category", "subCategory", "childCategory", "tag", "discount", "features", "description", "details", "status", "delivery", "warranty", "colors", "sizes", "rating", "files"],
                properties: {
                  name: { type: "string", example: "Wireless Bluetooth Headphones" },
                  price: { type: "number", example: 49.99 },
                  brand: { type: "string", example: "SoundMaster" },
                  category: { type: "string", pattern: "^[0-9a-fA-F]{24}$", example: "664d9be7f111c12d40179a01" },
                  subCategory: { type: "string", pattern: "^[0-9a-fA-F]{24}$", example: "664d9be7f111c12d40179b02" },
                  childCategory: { type: "string", pattern: "^[0-9a-fA-F]{24}$", example: "664d9be7f111c12d40179c03" },
                  tag: { type: "string", pattern: "^[0-9a-fA-F]{24}$", example: "664d9be7f111c12d40179d04" },
                  discount: { type: "number", example: 10 },
                  features: { type: "string", example: "Active Noise Cancelling, 40H Playtime, Bluetooth 5.2" },
                  description: { type: "string", example: "Premium overhead Bluetooth headphones with active noise cancellation." },
                  details: { type: "string", example: "Contains headphones, charging cable, AUX cable, and instruction manual." },
                  status: { type: "string", enum: ["available", "unavailable"], example: "available" },
                  delivery: { type: "string", example: "Free Shipping in 3 days" },
                  warranty: { type: "string", example: "1 Year Limited Warranty" },
                  colors: { type: "string", example: "Black,Silver" },
                  sizes: { type: "string", example: "One Size" },
                  rating: { type: "number", example: 4.8 },
                  files: {
                    type: "array",
                    items: { type: "string", format: "binary" },
                    description: "Select multiple image files to upload as product imagery gallery.",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Product created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Product created successfully" },
                    data: { $ref: "#/components/schemas/ProductResponse" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/products/paginate/{page}": {
      get: {
        tags: ["Products"],
        summary: "Paginated Product Listings",
        description: "Public fetch endpoint serving inventory split into pages of items.",
        parameters: [
          { name: "page", in: "path", required: true, schema: { type: "integer", default: 1 } },
        ],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Products fetched for page 1" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ProductResponse" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/products/filter/{type}/{page}/{id}": {
      get: {
        tags: ["Products"],
        summary: "Filter Products dynamically",
        description: "Retrieves products custom filtered by type parameters (e.g. category, tag, subcategory) for dynamic UI grids.",
        parameters: [
          { name: "type", in: "path", required: true, schema: { type: "string", enum: ["category", "subCategory", "childCategory", "tag"] } },
          { name: "page", in: "path", required: true, schema: { type: "integer" } },
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "ObjectID reference for target filter term" },
        ],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Filtered products fetched" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ProductResponse" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get Product Details",
        description: "Returns full product spec indices by unique ObjectID.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Single product details" },
                    data: { $ref: "#/components/schemas/ProductResponse" },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Products"],
        summary: "Update Product Specifications",
        description: "Allows reconfiguring existing catalog index properties. Admin only.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  price: { type: "number" },
                  brand: { type: "string" },
                  discount: { type: "number" },
                  features: { type: "string" },
                  description: { type: "string" },
                  status: { type: "string", enum: ["available", "unavailable"] },
                  file: { type: "string", format: "binary", description: "Upload cover image" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Product updated successfully" },
                    data: { $ref: "#/components/schemas/ProductResponse" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Purge Product catalog index",
        description: "Permanently deletes a catalog product. Admin only.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Purged successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Product deleted successfully" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/cart": {
      get: {
        tags: ["Cart"],
        summary: "Fetch User Shopping Cart",
        description: "Retrieves the active customer's items loaded into their shopping basket session.",
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "User shopping cart" },
                    data: { $ref: "#/components/schemas/CartResponse" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Cart"],
        summary: "Clear Shopping Cart",
        description: "Destroys all active item indices stored in the user's shopping basket.",
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Cart cleared successfully" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/cart/add": {
      post: {
        tags: ["Cart"],
        summary: "Insert Items to Shopping Cart",
        description: "Adds product selections to the user's shopping basket session. Increments quantities if already present.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CartAdd" },
            },
          },
        },
        responses: {
          201: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Items added to cart successfully" },
                    data: { $ref: "#/components/schemas/CartResponse" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/cart/item/{id}": {
      patch: {
        tags: ["Cart"],
        summary: "Update Cart Item properties",
        description: "Changes the quantity or changes the selection flag on a target product item in active cart.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "The product ObjectID reference inside the cart" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CartItemUpdate" },
            },
          },
        },
        responses: {
          200: {
            description: "Updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Cart item updated successfully" },
                    data: { $ref: "#/components/schemas/CartResponse" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Cart"],
        summary: "Remove Item from Cart",
        description: "Strips a specific product index entirely from the active shopping cart.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "The target product ObjectID" },
        ],
        responses: {
          200: {
            description: "Removed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Cart item removed successfully" },
                    data: { $ref: "#/components/schemas/CartResponse" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/cart/total": {
      get: {
        tags: ["Cart"],
        summary: "Get Cart Totals",
        description: "Returns cost computations (subtotal, shipping, discounts) and selected item counts from active cart session.",
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Cart totals calculated" },
                    data: {
                      type: "object",
                      properties: {
                        subtotal: { type: "number", example: 99.98 },
                        itemCount: { type: "integer", example: 2 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/cart/checkout": {
      post: {
        tags: ["Cart"],
        summary: "Checkout Selected Items",
        description: "Creates an active shipping draft order based exclusively on selected cart items, clearing them from basket session.",
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Checkout draft order created successfully" },
                    data: { $ref: "#/components/schemas/OrderResponse" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/orders": {
      get: {
        tags: ["Orders"],
        summary: "List Orders Ledger",
        description: "Returns an array of orders. Requires supervisor/admin/owner roles.",
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "All system orders" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/OrderResponse" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Orders"],
        summary: "Create New Order (Admin Override)",
        description: "Forces a new system order insertion in DB. Restricted to admins only.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OrderCreate" },
            },
          },
        },
        responses: {
          201: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Order created successfully" },
                    data: { $ref: "#/components/schemas/OrderResponse" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Get Order Details",
        description: "Retrieves order status.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Single order details" },
                    data: { $ref: "#/components/schemas/OrderResponse" },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Orders"],
        summary: "Update Order Shipping status",
        description: "Modifies order parameters (like items, addresses, or flags e.g. PENDING, SHIPPED, DELIVERED). Admin only.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OrderCreate" },
            },
          },
        },
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Order updated successfully" },
                    data: { $ref: "#/components/schemas/OrderResponse" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Orders"],
        summary: "Delete Order Index",
        description: "Destroys standard tracking index. Admin only.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Purged successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Order deleted successfully" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/payments/create-checkout-session": {
      post: {
        tags: ["Payments"],
        summary: "Initialize Stripe Checkout Session",
        description: "Fetches order items, translates costs to cents, and creates a secure redirectable Stripe Checkout payment URL.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PaymentSessionCreate",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Session successfully initialized",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Checkout session created successfully" },
                    data: {
                      type: "object",
                      properties: {
                        sessionId: { type: "string", example: "cs_test_..." },
                        sessionUrl: { type: "string", format: "uri", example: "https://checkout.stripe.com/pay/cs_test_..." },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Target order ID not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/payments/history": {
      get: {
        tags: ["Payments"],
        summary: "View Payment Ledger History",
        description: "Retrieves complete transactional ledger history associated with the customer profile.",
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "User payment history" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          _id: { type: "string", example: "664d9be7f111c12d40179f11" },
                          orderId: { type: "string", example: "664d9be7f111c12d40179d08" },
                          transactionId: { type: "string", example: "pi_3Mtw..." },
                          amount: { type: "number", example: 49.99 },
                          status: { type: "string", example: "succeeded" },
                          paymentMethod: { type: "string", example: "card" },
                          createdAt: { type: "string", format: "date-time" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/payments/order/{id}": {
      get: {
        tags: ["Payments"],
        summary: "Get Payment details by Order ID",
        description: "Returns ledger metrics matching order reference indices.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Payment details fetched successfully" },
                    data: {
                      type: "object",
                      properties: {
                        _id: { type: "string", example: "664d9be7f111c12d40179f11" },
                        orderId: { type: "string", example: "664d9be7f111c12d40179d08" },
                        transactionId: { type: "string", example: "pi_3Mtw..." },
                        amount: { type: "number", example: 49.99 },
                        status: { type: "string", example: "succeeded" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/payments/webhook": {
      post: {
        tags: ["Payments"],
        summary: "Stripe Webhook Event Receiver",
        description: "Receives raw event notifications directly from Stripe. Employs robust cryptographic signature verification using Stripe-Signature headers to securely update matching payment and order states.",
        security: [],
        parameters: [
          {
            name: "stripe-signature",
            in: "header",
            required: true,
            schema: { type: "string" },
            description: "Cryptographic payload signature header dispatched by Stripe.",
          },
        ],
        responses: {
          200: {
            description: "Webhook successfully verified and processed",
            content: {
              "text/plain": {
                schema: { type: "string", example: "Webhook Received" },
              },
            },
          },
          400: {
            description: "Signature mismatch or invalid webhook payload",
            content: {
              "text/plain": {
                schema: { type: "string", example: "Webhook Error: Signature validation failed" },
              },
            },
          },
        },
      },
    },
    "/api/v1/addresses": {
      get: {
        tags: ["Addresses"],
        summary: "Fetch User Address Book",
        description: "Retrieves all saved shipping addresses associated with the currently authenticated customer profile. Ordered chronologically.",
        responses: {
          200: {
            description: "List of address locations returned",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "All saved addresses" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/AddressResponse" },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "JWT Bearer token missing, invalid, or expired",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Addresses"],
        summary: "Add Shipping Location",
        description: "Saves a new shipping address. If this is the user's first address, it is automatically locked as the default shipping option. Selecting `isDefault` automatically clears previous user defaults.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AddressCreate",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Address added successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Address added successfully" },
                    data: { $ref: "#/components/schemas/AddressResponse" },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation requirements failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/addresses/{id}": {
      patch: {
        tags: ["Addresses"],
        summary: "Update Address Details",
        description: "Modifies parameters of a specific address index. If `isDefault` is toggled true, it unsets other saved addresses.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "MongoDB ObjectID reference of the target address.",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AddressUpdate",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Address successfully updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Address updated successfully" },
                    data: { $ref: "#/components/schemas/AddressResponse" },
                  },
                },
              },
            },
          },
          404: {
            description: "Target address ID not found or unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Addresses"],
        summary: "Delete Address Location",
        description: "Deletes the target address. If the deleted item was marked default, another active address will automatically inherit the default status.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "MongoDB ObjectID reference of the target address.",
          },
        ],
        responses: {
          200: {
            description: "Address successfully deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Address deleted successfully" },
                    data: { type: "object", nullable: true, example: null },
                  },
                },
              },
            },
          },
          404: {
            description: "Target address ID not found or unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/addresses/{id}/default": {
      patch: {
        tags: ["Addresses"],
        summary: "Lock Address as Default",
        description: "Locks the target address ID as the primary shipping location, automatically updating and clearing the default flag across all other addresses for the authenticated user.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "MongoDB ObjectID reference of the target address.",
          },
        ],
        responses: {
          200: {
            description: "Set default address successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    con: { type: "boolean", example: true },
                    msg: { type: "string", example: "Default address updated successfully" },
                    data: { $ref: "#/components/schemas/AddressResponse" },
                  },
                },
              },
            },
          },
          404: {
            description: "Address not found or access unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Authenticate by placing your access token in the headers as: 'Authorization: Bearer <your_jwt_token>'",
      },
    },
    schemas: {
      UserRegister: {
        type: "object",
        required: ["name", "email", "phone", "password"],
        properties: {
          name: { type: "string", example: "Aung Aung" },
          email: { type: "string", format: "email", example: "aung@example.com" },
          phone: { type: "string", minLength: 10, maxLength: 15, example: "09987654321" },
          password: { type: "string", minLength: 6, example: "securepassword123" },
        },
      },
      UserLogin: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "aung@example.com" },
          password: { type: "string", example: "securepassword123" },
        },
      },
      UserResponse: {
        type: "object",
        properties: {
          _id: { type: "string", example: "664d9be7f111c12d40179c96" },
          name: { type: "string", example: "Aung Aung" },
          email: { type: "string", format: "email", example: "aung@example.com" },
          phone: { type: "string", example: "09987654321" },
          isEmailVerified: { type: "boolean", example: false },
          roles: { type: "array", items: { type: "string" }, example: [] },
          permits: { type: "array", items: { type: "string" }, example: [] },
          wishlist: { type: "array", items: { type: "string" }, example: [] },
          createdAt: { type: "string", format: "date-time", example: "2026-05-22T12:00:00.000Z" },
        },
      },
      PermitCreate: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "WRITE_PRODUCTS" },
        },
      },
      PermitResponse: {
        type: "object",
        properties: {
          _id: { type: "string", example: "664d9be7f111c12d40179a02" },
          name: { type: "string", example: "WRITE_PRODUCTS" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      RoleCreate: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "admin" },
          permits: {
            type: "array",
            items: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            example: ["664d9be7f111c12d40179a02"],
          },
        },
      },
      RoleResponse: {
        type: "object",
        properties: {
          _id: { type: "string", example: "664d9be7f111c12d40179a99" },
          name: { type: "string", example: "admin" },
          permits: {
            type: "array",
            items: { type: "string" },
            example: ["664d9be7f111c12d40179a02"],
          },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      RoleAddPermit: {
        type: "object",
        required: ["roleId", "permitId"],
        properties: {
          roleId: { type: "string", pattern: "^[0-9a-fA-F]{24}$", example: "664d9be7f111c12d40179a99" },
          permitId: { type: "string", pattern: "^[0-9a-fA-F]{24}$", example: "664d9be7f111c12d40179a02" },
        },
      },
      CategoryResponse: {
        type: "object",
        properties: {
          _id: { type: "string", example: "664d9be7f111c12d40179a01" },
          name: { type: "string", example: "Electronics" },
          image: { type: "string", example: "electronics_cover.jpg" },
          subCategory: { type: "array", items: { type: "string" }, example: [] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      SubCategoryResponse: {
        type: "object",
        properties: {
          _id: { type: "string", example: "664d9be7f111c12d40179b02" },
          name: { type: "string", example: "Mobile Phones" },
          image: { type: "string", example: "mobiles_cover.jpg" },
          categoryId: { type: "string", example: "664d9be7f111c12d40179a01" },
          childCategories: { type: "array", items: { type: "string" }, example: [] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ChildCategoryResponse: {
        type: "object",
        properties: {
          _id: { type: "string", example: "664d9be7f111c12d40179c03" },
          name: { type: "string", example: "iOS Smartphones" },
          image: { type: "string", example: "ios_cover.jpg" },
          subCategoryId: { type: "string", example: "664d9be7f111c12d40179b02" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      TagResponse: {
        type: "object",
        properties: {
          _id: { type: "string", example: "664d9be7f111c12d40179d04" },
          name: { type: "string", example: "Summer Sale" },
          image: { type: "string", example: "tag_banner.jpg", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      DeliveryResponse: {
        type: "object",
        properties: {
          _id: { type: "string", example: "664d9be7f111c12d40179d11" },
          name: { type: "string", example: "Express Shipping" },
          price: { type: "number", example: 4.99 },
          duration: { type: "string", example: "1-2 Business Days" },
          image: { type: "string", example: "truck_icon.jpg" },
          remarks: { type: "string", example: "Fastest standard option" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      WarrantyResponse: {
        type: "object",
        properties: {
          _id: { type: "string", example: "664d9be7f111c12d40179d22" },
          name: { type: "string", example: "2 Year AppleCare Coverage" },
          image: { type: "string", example: "shield_icon.jpg" },
          remarks: { type: "string", example: "Full support packages", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      AddressCreate: {
        type: "object",
        required: ["fullName", "phone", "addressLine1", "city", "state", "zipCode"],
        properties: {
          fullName: { type: "string", example: "Aung Aung" },
          phone: { type: "string", example: "09987654321" },
          addressLine1: { type: "string", example: "No. 123, Bogyoke Road" },
          addressLine2: { type: "string", example: "Apartment 4B", nullable: true },
          city: { type: "string", example: "Yangon" },
          state: { type: "string", example: "Yangon Region" },
          zipCode: { type: "string", example: "11181" },
          country: { type: "string", example: "Myanmar", default: "Myanmar" },
          isDefault: { type: "boolean", example: false },
        },
      },
      AddressUpdate: {
        type: "object",
        properties: {
          fullName: { type: "string", example: "Aung Aung Updated" },
          phone: { type: "string", example: "09987654321" },
          addressLine1: { type: "string", example: "No. 456, Pyay Road" },
          addressLine2: { type: "string", example: "Apartment 2A", nullable: true },
          city: { type: "string", example: "Yangon" },
          state: { type: "string", example: "Yangon Region" },
          zipCode: { type: "string", example: "11051" },
          country: { type: "string", example: "Myanmar" },
          isDefault: { type: "boolean", example: true },
        },
      },
      AddressResponse: {
        type: "object",
        properties: {
          _id: { type: "string", example: "664d9be7f111c12d40179c99" },
          userId: { type: "string", example: "664d9be7f111c12d40179c96" },
          fullName: { type: "string", example: "Aung Aung" },
          phone: { type: "string", example: "09987654321" },
          addressLine1: { type: "string", example: "No. 123, Bogyoke Road" },
          addressLine2: { type: "string", example: "Apartment 4B", nullable: true },
          city: { type: "string", example: "Yangon" },
          state: { type: "string", example: "Yangon Region" },
          zipCode: { type: "string", example: "11181" },
          country: { type: "string", example: "Myanmar" },
          isDefault: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time", example: "2026-05-22T13:00:00.000Z" },
        },
      },
      ProductResponse: {
        type: "object",
        properties: {
          _id: { type: "string", example: "664d9be7f111c12d40179e05" },
          name: { type: "string", example: "Wireless Bluetooth Headphones" },
          price: { type: "number", example: 49.99 },
          brand: { type: "string", example: "SoundMaster" },
          category: { type: "string", example: "664d9be7f111c12d40179a01" },
          subCategory: { type: "string", example: "664d9be7f111c12d40179b02" },
          childCategory: { type: "string", example: "664d9be7f111c12d40179c03" },
          tag: { type: "string", example: "664d9be7f111c12d40179d04" },
          discount: { type: "number", example: 10 },
          features: { type: "string", example: "Active Noise Cancelling, 40H Playtime" },
          description: { type: "string", example: "Premium overhead Bluetooth headphones." },
          details: { type: "string", example: "Accessories included." },
          status: { type: "string", example: "available" },
          delivery: { type: "string", example: "Free Shipping" },
          warranty: { type: "string", example: "1 Year" },
          images: { type: "string", example: "headphone.jpg" },
          colors: { type: "string", example: "Black" },
          sizes: { type: "string", example: "One Size" },
          rating: { type: "number", example: 4.8 },
          user: { type: "string", example: "664d9be7f111c12d40179c96" },
        },
      },
      PaymentSessionCreate: {
        type: "object",
        required: ["orderId"],
        properties: {
          orderId: { type: "string", pattern: "^[0-9a-fA-F]{24}$", example: "664d9be7f111c12d40179d08" },
        },
      },
      CartAdd: {
        type: "object",
        required: ["items"],
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              required: ["productId"],
              properties: {
                productId: { type: "string", pattern: "^[0-9a-fA-F]{24}$", example: "664d9be7f111c12d40179e05" },
                quantity: { type: "integer", minimum: 1, example: 1 },
              },
            },
          },
        },
      },
      CartItemUpdate: {
        type: "object",
        properties: {
          quantity: { type: "integer", minimum: 0, example: 2 },
          selected: { type: "boolean", example: true },
        },
      },
      CartResponse: {
        type: "object",
        properties: {
          _id: { type: "string", example: "664d9be7f111c12d40179e44" },
          user: { type: "string", example: "664d9be7f111c12d40179c96" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                productId: { $ref: "#/components/schemas/ProductResponse" },
                quantity: { type: "integer", example: 1 },
                selected: { type: "boolean", example: true },
              },
            },
          },
        },
      },
      OrderCreate: {
        type: "object",
        required: ["shippingAddress", "items", "status"],
        properties: {
          shippingAddress: {
            type: "object",
            required: ["fullName", "phone", "addressLine1", "city", "state", "zipCode"],
            properties: {
              fullName: { type: "string", example: "Aung Aung" },
              phone: { type: "string", example: "09987654321" },
              addressLine1: { type: "string", example: "No. 123, Bogyoke Road" },
              addressLine2: { type: "string", example: "Apartment 4B", nullable: true },
              city: { type: "string", example: "Yangon" },
              state: { type: "string", example: "Yangon Region" },
              zipCode: { type: "string", example: "11181" },
              country: { type: "string", example: "Myanmar" },
            },
          },
          items: {
            type: "array",
            items: {
              type: "object",
              required: ["productId", "count"],
              properties: {
                productId: { type: "string", pattern: "^[0-9a-fA-F]{24}$", example: "664d9be7f111c12d40179e05" },
                count: { type: "integer", minimum: 1, example: 1 },
              },
            },
          },
          status: { type: "string", enum: ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"], example: "PENDING" },
        },
      },
      OrderResponse: {
        type: "object",
        properties: {
          _id: { type: "string", example: "664d9be7f111c12d40179d08" },
          user: { type: "string", example: "664d9be7f111c12d40179c96" },
          shippingAddress: {
            type: "object",
            properties: {
              fullName: { type: "string", example: "Aung Aung" },
              phone: { type: "string", example: "09987654321" },
              addressLine1: { type: "string", example: "No. 123, Bogyoke Road" },
              addressLine2: { type: "string", example: "Apartment 4B", nullable: true },
              city: { type: "string", example: "Yangon" },
              state: { type: "string", example: "Yangon Region" },
              zipCode: { type: "string", example: "11181" },
              country: { type: "string", example: "Myanmar" },
            },
          },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                productId: { type: "string", example: "664d9be7f111c12d40179e05" },
                count: { type: "integer", example: 1 },
              },
            },
          },
          status: { type: "string", example: "PENDING" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          con: { type: "boolean", example: false },
          msg: { type: "string", example: "Detailed error explanation message here" },
        },
      },
    },
  },
};

module.exports = { swaggerSpec };
