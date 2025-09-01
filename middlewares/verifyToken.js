const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(401)
        .send({ message: "Unauthorized: No token provided" });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(422).send({ message: "Invalid authentication" });
    }

    const userDetails = jwt.verify(token, process.env.JWT_SECRET);

    req.user = userDetails;

    next();
  } catch (error) {
    res
      .status(401)
      .send({ message: "Unauthorized: Invalid token", error: error.message });
  }
}

module.exports = verifyToken;
