var exec = require('child_process').exec;
var fs =require("fs");

 exec("cp "+__dirname+"/public/contentScript.js "+__dirname+"/build/static/js/contentScript.js", function (error, stdout, stderr) {
    if (error !== null) {
        console.log('exec error: ' + error);
    } else {
        console.log("Content script has been moved successfully");
    }
});
 exec("mv "+__dirname+"/build/static/js/main*.js "+__dirname+"/build/static/js/main.js", function (error, stdout, stderr) {
    if (error !== null) {
        console.log('exec error: ' + error);
    } else{
        console.log("Main.js file has been generated successfully");
    }
});

exec("mv "+__dirname+"/build/static/css/main*.css "+__dirname+"/build/static/css/main.css", function (error, stdout, stderr) {
    if (error !== null) {
        console.log('exec error: ' + error);
    } else{
        console.log("Main.css file has been generated successfully");
    }
});


exec("rm -f "+__dirname+"/build/static/js/main*.js.map ", function (error, stdout, stderr) {
    if (error) {
        console.log('exec error: ' + error);
    } else{
        console.log(stdout);
        console.log("Main*.js.map file has been deleted successfully");
    }
});


exec("rm -f "+__dirname+"/build/static/css/main*.css.map ", function (error, stdout, stderr) {
    if (error) {
        console.log('exec error: ' + error);
    } else{
        console.log("Main*.css.map file has been deleted successfully");
    }
});


