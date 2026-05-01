const { createRemoteJWKSet, jwtVerify } = require("jose");

const getRequiredEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
};

const buildIssuer = (region, userPoolId) =>
  `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

const getJwks = (region, userPoolId) => {
  const issuer = buildIssuer(region, userPoolId);
  return createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
};

const validateAudience = (payload, clientId, tokenUse) => {
  if (tokenUse === "access") {
    return payload.client_id === clientId;
  }
  return payload.aud === clientId;
};

const enforceUserMatch = (payload, userId) => {
  if (!userId) return true;
  return payload.sub === userId;
};

const cognitoAuth = async (req, res, next) => {
  try {
    const region = getRequiredEnv("COGNITO_REGION");
    const userPoolId = getRequiredEnv("COGNITO_USER_POOL_ID");
    const clientId = getRequiredEnv("COGNITO_CLIENT_ID");
    const tokenUse = (process.env.COGNITO_TOKEN_USE || "access").toLowerCase();
    const enforceMatch = (process.env.COGNITO_ENFORCE_USER_MATCH || "true").toLowerCase();

    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing Bearer token" });
    }

    const token = authHeader.slice("Bearer ".length).trim();
    if (!token) {
      return res.status(401).json({ message: "Empty Bearer token" });
    }

    const jwks = getJwks(region, userPoolId);
    const issuer = buildIssuer(region, userPoolId);

    const { payload } = await jwtVerify(token, jwks, {
      issuer,
    });

    if (payload.token_use !== tokenUse) {
      return res.status(401).json({ message: "Invalid token_use" });
    }

    if (!validateAudience(payload, clientId, tokenUse)) {
      return res.status(401).json({ message: "Invalid token audience" });
    }

    if (enforceMatch === "true" && !enforceUserMatch(payload, req.params.userId)) {
      return res.status(403).json({ message: "User mismatch" });
    }

    req.auth = payload;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized",
      error: error.message,
    });
  }
};

module.exports = {
  cognitoAuth,
};
