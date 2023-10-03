module.exports = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    apiKey: process.env.publicApiKey || '',
    autoDomain: process.env.FIREBASE_AUTH_HOST || '',
    projectId: process.env.projectId || '',
  },
};
