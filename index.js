import express from "express";
import bcrypt from "bcrypt";
import { users } from "./store.js";
import jwt from "jsonwebtoken";
import { limitRate } from "./middleware.js";
import { v4 as uuidv4 } from "uuid";

const app = express();

app.use(express.json());
app.use(limitRate);

app.get("/", (req, res) => {
  res.send({ msg: "Health check" });
});

app.post("/", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword, count: 0 });
  res.status(201).send({ username });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const isUser = users.find((user) => user.username === username);
  console.log(isUser);

  if (isUser) {
    const isValidPassword = await bcrypt.compare(password, isUser.password);
    if (isValidPassword) {
      isUser.count += 1;
      const access_token = jwt.sign({ username }, "secret", {
        expiresIn: 10000,
      });
      return res.status(200).send({ access_token });
    }
  }
  res.status(401).send({ msg: "invalid username or password" });
});

app.post("/onetimelink", (req, res) => {
  const { username } = req.body;
  const user = users.find((user) => user.username === username);
  if (user) {
    let uniqueId = uuidv4();
    user.linkId = uniqueId;
    return res
      .status(200)
      .send({ link: `http://localhost:3000/api/${uniqueId}` });
  }
  return res.status(401).send({ msg: "no such user" });
});

app.get("/api/:id", (req, res) => {
  const id = req.params.id;
  const user = users.find((user) => user.linkId === id);
  if (user) {
    user.count += 1;
    user.linkUsed = true;
    const access_token = jwt.sign({ username: user.username }, "secret", {
      expiresIn: 10000,
    });
    return res.status(200).send({ access_token });
  }
});

app.listen(3000, () => {
  console.log(`server is running at port 3000`);
});
