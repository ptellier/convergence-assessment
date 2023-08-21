const jwt = require("jsonwebtoken");
require("dotenv").config();

const checkAuthorized = async (access_token) => {
  let ans;
  await jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      ans = {error: "Not authorized"};
    } else {
      ans = { username: decoded.username };
    }
  });
  return ans;
};

module.exports = checkAuthorized;