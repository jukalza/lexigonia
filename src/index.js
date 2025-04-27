const app = require('../src/server');
const serverless = require('serverless-http');

module.exports = serverless(app);