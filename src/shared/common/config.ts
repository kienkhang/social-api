const appConfig = {
  db: {
    mongodbName: process.env.MONGODB_NAME,
    mongodbUser: process.env.MONGODB_USER,
    mongodbPassword: process.env.MONGODB_PASSWORD,
  },
  imagekit: {
    id: process.env.IMAGE_KIT_ID,
    privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
    publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
    endpoint: process.env.IMAGE_KIT_URL_ENDPOINT,
  },
  jwt: {
    secretKey: process.env.SECRET_JWT,
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  },
  app: {
    hashPasswordKey: process.env.SECRET_PASSWORD,
    port: process.env.APP_PORT,
    prefixApiUrl: process.env.PREFIX_API_URL as string,
    corsWhiteList: ['http://localhost:8081', 'http://localhost:5173'],
  },
  oauth: {
    ggClientId: process.env.GG_OAUTH_CLIENT_ID,
    ggClientSecret: process.env.GG_OAUTH_CLIENT_SECRET,
  },
};

export default appConfig;
