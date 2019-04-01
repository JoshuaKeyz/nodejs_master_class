/**
 * Create and export configuration variables
 * 
 */

// Container for all the environments
var environments = {};

// Staging (default) environment
environments.staging = {
  'httpPort': 3000, 
  'httpsPort': 3001,
  'envName': 'staging',
  'hashingSecret': 'thisIsASecret',
  'maxChecks': 5, 
  'twilio': {
    'accountSid': 'AC1cec5286178d8d9f42feb053d709765a', 
    'authToken': '2fe9b22826491c80bd23a50321c74d65', 
    'fromPhone': '+12702079445'
  }
};

// Production environment 
environments.production = {
  'httpPort': 5000, 
  'httpsPort': 5001,
  'envName': 'production',
  'hashingSecret': 'thisIsAlsoASecret',
  'maxChecks': 5,
  'twilio': {
    'accountSid': 'AC1cec5286178d8d9f42feb053d709765a', 
    'authToken': '2fe9b22826491c80bd23a50321c74d65', 
    'fromPhone': '+12702079445'
  }
};

// Determine which environment was passed as a command-line argument
var currentEnviroment = typeof(process.env.NODE_ENV) === 'string' ?
  process.env.NODE_ENV.toLowerCase() : '';

// Check that the curent enviroment is one of the enviroments above, if not
// default to staging
var environmentToExport = typeof(environments[currentEnviroment]) === 'object' ?
  environments[currentEnviroment] : environments.staging;

// Export the module
module.exports = environmentToExport;