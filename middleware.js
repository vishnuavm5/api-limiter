import { users } from "./store.js";

export function limitRate(req, res, next) {
  const { username, password } = req.body;
  const user = users.find((user) => user.username === username);
  if (user?.count >= 5 || user?.locked === true) {
    user.locked = true;
    return res.status(400).send({ msg: "stop spamming" });
  }
  next();
}

export function linkUsed(req, res, next) {
  const id = req.params.id;
  const user = users.find((user) => user.linkId === id);
  if (user?.linkUsed) {
    return res.status(401).send({ msg: "link already used" });
  } else {
    next();
  }
}
