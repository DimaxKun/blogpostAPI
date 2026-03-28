const serverlessExpress = require('@codegenie/serverless-express');
const { app } = require('./index');

const serverlessExpressInstance = serverlessExpress({ app });

exports.handler = async (event, context) => {
  return serverlessExpressInstance(event, context);
};
