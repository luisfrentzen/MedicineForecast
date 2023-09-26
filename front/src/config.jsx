const config = {
  env: "prod",
  development: {
    apiEndpoint: "http://localhost:8000",
  },
  production: {
    apiEndpoint: "https://medifore.luisfrentzen.com:8000",
  },
};

export default config;
