/**
 * Library for storing and rotating logs
 */

// Dependencies
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');

// Container for the module
var lib = {};

lib.baseDir = path.join(__dirname, '/../.logs/');

// Append a string to a file. Create the file if it doesn't not exist.
lib.append = function(file, str, callback) {
  // Open the file for appending
  fs.open(lib.baseDir + file + '.log', 'a', function(err, fd) {
    if(!err && fd) {
      // Append to the file and close it
      fs.appendFile(fd, str + '\n', function(err){
        if(!err) {
          fs.close(fd, (err)=>{
            if(!err){
              callback(false);
            }else {
              callback('Error closing file that was appended');
            }
          });
        }else {
          callback('Error appending to file');
        }
      })
    } else {
      callback('Could not open file for appending');
    }
  })
};

// List all the logs, and optionally include the compressed logs
lib.list = function(includeCompressedLogs, callback) {
  fs.readdir(lib.baseDir, (err, data)=>{
    if(!err && data && data.length > 0) {
      var trimmedFileName = [];
      data.forEach((fileName)=>{
        // Add the .log files
        if(fileName.indexOf('.log') > -1) {
          trimmedFileName.push(fileName.replace('.log', ''));
        }

        // Add on the .gz files
        if(fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs) {
          trimmedFileName.push(fileName.replace('.gz.b64', ''));
        }
      });
      callback(false, trimmedFileName);
    } else {
      callback(err, data);
    }
  })
}

// Compress the contents of one .log file into a .gz.b64 file within the same directory
lib.comporess = function(logId, newFileId, callback){
  var sourceFile = logId +'.log';
  var destFile = newFileId + '.gz.b64';

  // Read the source file
  fs.readFile(lib.baseDir + sourceFile, 'utf8', (err, inputString)=>{
    if(!err && inputString) {
      // Compress the data using gzip
      zlib.gzip(inputString, (err, buffer)=>{
        if(!err && buffer){
          // Send the data to the destination file
          fs.open(lib.baseDir + destFile,'wx',(err, fd)=>{
            if(!err && fd) {
              // Write to the destination file
              fs.writeFile(fd, buffer.toString('base64'), (err)=>{
                if(!err) {
                  // close the destination file
                  fs.close(fd, (err)=>{
                    if(!err){
                      callback(false);
                    }else {
                      callback(err);
                    }
                  });
                } else {
                  callback(err);
                }
              })
            }else {
              callback(err);
            }
          } )
        } else {
          callback(err);
        }
      })
    } else {
      callback(err);
    }
  })
}

// Decompress the contents of a .gz.b64 file into a string variable
lib.decompress  = (fleId, callback)=>{
  var fileName = fileId +'.gz.b64';

  fs.readFile(lib.baseDir + fileName, 'utf8', (err, str)=>{
    if(!err && str) {
      // Decompress the data
      var inputBuffer = Buffer.from(str, 'base64');
      zlib.unzip(inputBuffer, (err, outputBuffer)=>{
        if(!err && outputBuffer) {
          // callback
          const str = outputBuffer.toString();
          callback(false, str);
        } else {
          callback(err);
        }
      })
    } else {
      callback(err);
    }
  })
};

// Truncate a log file
lib.truncate = (logId, callback)=>{
  fs.truncate(lib.baseDir + logId + '.log', 0, function(err){
    if(!err) {
      callback(false);
    }else {
      callback(err);
    }
  })
}
// Export the module
module.exports = lib;