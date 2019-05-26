const SwaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
require('./../');

swaggerDocument.servers[0].url = process.env.BASE_URL + 'api/';
module.exports = [SwaggerUi.serve, SwaggerUi.setup(swaggerDocument)];
