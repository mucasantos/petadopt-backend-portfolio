const swaggerAuto = require("swagger-autogen")()

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./index.js"];

const doc = {
  info: {
    title: 'PetAdopt API',
    description: 'RESTful API for the pet adoption platform'
  },
  basePath: '/'
};

swaggerAuto(outputFile, endpointsFiles, doc);