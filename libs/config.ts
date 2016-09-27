export default {
  env: "PROD",
  database: {
    connectionString: 'postgres://docker:docker@dashnifty.cloudapp.net:5432/niftyDash'
  },
  session: {
    secret: 'super secret'
  }
};
