export default {
  env: "DEV",
  database: {
    connectionString: 'postgres://docker:docker@dashnifty.cloudapp.net:5432/niftyDash'
  },
  session: {
    secret: 'super secret'
  }
};
