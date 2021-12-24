const winston = require('winston');
var path = require('path')    

var logger =  winston.createLogger({
  transports: [
    new winston.transports.File({
      level: 'error',
      filename: path.join(__dirname,'/errorFile/filelog-error.log'),
      json: true,
      format: winston.format.combine(winston.format.timestamp(), winston.format.json())
    }),
    new winston.transports.File({
      level: 'debug',
      filename: path.join(__dirname,'/errorFile/filelog-debug.log'),
      json: true,
      format: winston.format.combine(winston.format.timestamp(), winston.format.json())
    }),
    new winston.transports.File({
      level: 'info',
      filename: path.join(__dirname,'/errorFile/filelog-info.log'),
      json: true,
      format: winston.format.combine(winston.format.timestamp(), winston.format.json())
    })
  ]
});

logger.stream = {
 write: function (message, encoding) {
        logger.info(message)
  }
}

module.exports = logger