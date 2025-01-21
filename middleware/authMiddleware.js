import jwt from "jsonwebtoken";

async function authMiddleware(req, res, next) {
  // Access the cookies, retrieve data saved when the accessToken is created.
  const { accessToken } = req.cookies;
  // Decodes the role and id from the accessToken
  // If the accessToken is not found, return an error message
  if (!accessToken) {
    return res
      .status(401)
      .json({ error: "Unauthorized! Please log in first." });
  } else {
    // If the accessToken is found, verify the token
    try {
      const decodeToken = await jwt.verify(accessToken, process.env.JWT_SECRET);
      console.log(decodeToken);
      req.role = decodeToken.role;
      req.id = decodeToken.id;
      console.log(req.role);
      console.log(req.id);
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ error: "Unauthorized! Please log in first." });
    }
    // jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    //   // If the token is invalid, return an error message
    //   if (err) {
    //     return res.status(401).json({ error: "Unauthorized! Please log in first." });
    //   } else {
    //     // If the token is valid, save the decoded data to the request object
    //     req.user = decoded;
    //     // console.log(req.user);
    //     next();
    //   }
    // });
  }
}

export { authMiddleware };
