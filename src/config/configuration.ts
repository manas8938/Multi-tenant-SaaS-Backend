export const configuration = () => ({
  port: parseInt(process.env.APP_PORT || '3000', 10),
  database: {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  },
});
