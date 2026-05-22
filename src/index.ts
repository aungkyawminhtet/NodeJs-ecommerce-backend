require("dotenv").config();
import Express = require("express");
import type e = require("express");
import path = require("path");
import core = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const userDB = require("./models/user");
const { initialize } = require("./utils/chat");
const { fMs, verifyToken } = require("./utils/helper");

//default migration
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
const subCategory = require("./routes/subCatRoute");
const childCategory = require("./routes/childCatRouter");
const tag = require("./routes/tagRoute");
const delivery = require("./routes/deliveryRoute");
const warranty = require("./routes/warrantyRoute");
const product = require("./routes/productRoute");
const order = require("./routes/orderRoute");
const cart = require("./routes/cartRoute");
const payment = require("./routes/paymentRoute");
const auth = require("./routes/authRoute");
const address = require("./routes/addressRoute");
const swaggerUi = require("swagger-ui-express");
const { swaggerSpec } = require("./docs/swaggerSpec");

const app = Express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(
  Express.json({
    verify: (req: any, res: any, buf: Buffer) => {
      if (req.originalUrl.startsWith("/api/v1/payments/webhook")) {
        req.rawBody = buf;
      }
    },
  })
);
app.use(core());
app.use(helmet());
app.use(cookieParser());
app.use(uploadFile());
app.use("/uploads", Express.static(path.join(__dirname, "../uploads")));

DbConnect();

app.use("/api/v1/users", user);
app.use("/api/v1/tags", tag);
app.use("/api/v1/permits", permit);
app.use("/api/v1/roles", role);
app.use("/api/v1/orders", order);
app.use("/api/v1/deliveries", delivery);
app.use("/api/v1/categories", category);
app.use("/api/v1/warranties", warranty);
app.use("/api/v1/subcategories", subCategory);
app.use("/api/v1/childcategories", childCategory);
app.use("/api/v1/products", product);
app.use("/api/v1/cart", cart);
app.use("/api/v1/payments", payment);
app.use("/api/v1/auth", auth);
app.use("/api/v1/addresses", address);

// Mount interactive Swagger API documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//err handler
app.use((err: any, req: e.Request, res: e.Response, next: e.NextFunction) => {
  const status = err.status || 500;
  res.status(status).json({
    con: false,
    msg: err.message,
  });
});

io.of("/chat")
  .use(async (socket: any, next: any) => {
    let token = socket.handshake.query.token;
    if (token) {
      let usr = verifyToken(token);
      let user = await userDB.findById(usr._id);
      if (user) {
        // console.log("Socket auth token:", usr);
        socket.userData = user;
        next();
      } else {
        return next(new Error("User not found"));
      }
    } else {
      return next(new Error("Authentication error: Token not provided"));
    }
  })

  .on("connection", (socket: any) => {
    console.log("A user connected");
    initialize(io, socket);
  });

// io.on('connection', (socket: any) => {
//   console.log('A user connected');

//   socket.on('test', (data: any) => {
//     console.log('Test data received:',data);

//     if(data === "send"){
//       io.emit('success', 'Hello from the server!');
//       console.log('Response sent to client');
//     }
//   });
// });

const defaultData = async () => {
    // await defaultMigration();
  // await backupData();
  // await DefaultRolePermit();
  // await addPermitRole();
    // await addPermitRole();
};

defaultData();

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
