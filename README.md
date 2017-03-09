# Near Real Time Threat Detection

App designed to identify threat detection from a log uploaded by user. It will read each line of log and print `YES` if it is a threat or `NO` if it is not.
This application is hosted on [Heroku](https://salty-dawn-89755.herokuapp.com/).

## Running Locally
Make sure you have [Node.js](http://nodejs.org/) installed.
```sh
$ git clone https://github.com/sanmak/threatdetection.git # or clone your own fork
$ cd threatdetection
$ npm install
$ npm start
```

Your app should now be running on [localhost:5000](http://localhost:8080/).

## Documentation 

- `LOG FORMAT` :  HTTP_METHOD URL HTTP_VERSION ORIGIN_HEADER  SSL_CIPHER SSL_PROTOCOL DATETIME LB_NAME CLIENT_IP:port BACKEND_IP:port request_processing_time backend_processing_time response_processing_time elb_status_code backend_status_code received_bytes sent_bytes
- If log has `ORIGIN_HEADER` = `MATLAB R2013a`, then it will consider as threat. OR
- If log has `client ip` from outside india, will be considered as threat. For ip detection, `https://freegeoip.net` services has been used.
