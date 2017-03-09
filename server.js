var express = require('express');
var app = express();
var path = require('path');
const formidable = require('formidable'),
async = require('async');
var exec = require('child_process').exec;

app.set('port', (process.env.PORT || 8080));

app.use(express.static(__dirname + '/'));
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
app.post('/upload',function(req,res){
	let form = new formidable.IncomingForm();
	let filePath = '';
    form.parse(req);
    form.on('fileBegin', function (name, file){
        file.path = __dirname + '/' + file.name;
        filePath = file.path;
    });
    form.on('file', function (name, file){
        console.log('Uploaded ' + file.name,file.path);
    });
    form.on('end', function() {
		readAndReturn(filePath,function(error,response){
			if(error){
				res.send({'error' : error,'res' : null});		
			}
			else{
				formResult(response,function(error,resP){
					deleteFile(filePath);
					if(error){
						res.send({'error' : error,'res' : null});
					}
					else{
						res.send({'error' : null,'res' : resP});
					}
					
				});
			}
		})
	});
    form.on('error', function(err) {
		res.send(err);
	});
});
function readAndReturn(filepath,callback){
	let arrLine = [];
	var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(filepath)
  	});
  	lineReader.on('line', function (line) {
	    if(line.length > 0){
	      arrLine.push(line.replace(/['"]+/g, ''));
	    }
 	});
  	lineReader.on('close',function(line){
  		callback(null,arrLine);
  	});
  	lineReader.on('error',function(err){
  		callback(err,null);
  	})
}
function formResult(filesArray,callback){
	let sendData = [];
	let errorCode = 'HTTP_METHOD URL HTTP_VERSION ORIGIN_HEADER  SSL_CIPHER SSL_PROTOCOL DATETIME LB_NAME CLIENT_IP:port BACKEND_IP:port request_processing_time backend_processing_time response_processing_time elb_status_code backend_status_code received_bytes sent_bytes';
	errorCode = errorCode.split(" ");
	async.each(filesArray,function(line,callback){
		let splitLine = line.split(" ");
     	let tempData = {};
		let matlabIndex = splitLine.indexOf('MATLAB'),
	    R2013a = splitLine.indexOf('R2013a'),
	    ORIGIN_HEADER = errorCode.indexOf('ORIGIN_HEADER'),
	    clientIpIndex = errorCode.indexOf('CLIENT_IP:port');
	    logClientIp = line.match(/(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\:\d{2,5}/),
	    logclientIpIndex = splitLine.indexOf(logClientIp[0]);
	    actualIp = (splitLine[logclientIpIndex]).split(':')[0],
	    url = 'https://freegeoip.net/json/'+actualIp;
		tempData['log'] = line;
    	tempData['result'] = 'NO';
    	if(matlabIndex > 0 && R2013a > 0 && (R2013a == matlabIndex + 1) && matlabIndex == ORIGIN_HEADER){
	      tempData['result'] = "YES"
	      sendData.push(tempData);
	      callback();
	    }
	     else{
	        exec('curl ' + url, function (error, stdout, stderr) {
	          if (error !== null) {
	            console.log('exec error: ' + error);
	            callback(error);
	            // tempData['result'] = error;
	          }
	          else{
	            console.log('stdout: ' + typeof stdout);
	            let data = JSON.parse(stdout);
	            if((data.country_name).toUpperCase() !== 'INDIA'){
	                 tempData['result'] = 'YES';
	            }
	            sendData.push(tempData);
	          	callback();
	          }
	        });
	    }
	},function(err){
		callback(err,sendData);	
	});
}
function deleteFile(filePath){
	exec('rm -f ' + filePath, function (error, stdout, stderr) {
		if(error)
			console.log(error);
	});
}

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});