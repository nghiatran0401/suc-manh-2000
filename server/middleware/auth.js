const {firestore} = require("../firebase");

const AuthMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;
  if (token != null && token != "") {
    firestore
        .auth()
        .verifyIdToken(token)
        .then(async (decodedToken) => {
          res.locals = decodedToken;
          next();
        })
        .catch((error) => {
          res.sendStatus(403);
        });
  } else {
    res.sendStatus(403);
  }
};

module.exports = {
  AuthMiddleware,
};
