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

exec("mkdir "+__dirname+"/build/static/css/themes", function (error, stdout, stderr) {
    if (error !== null) {
        console.log('exec error: ' + error);
    } else {
        console.log("Created static/css/themes");
    }
});

exec("mv "+__dirname+"/build/static/css/main*.css "+__dirname+"/build/static/css/main.css", function (error, stdout, stderr) {
    if (error !== null) {
        console.log('exec error: ' + error);
    } else{
        console.log("Main.css file has been generated successfully");
    }
});

exec("mv "+__dirname+"/build/background.js "+__dirname+"/build/static/js/background.js", function (error, stdout, stderr) {
    if (error !== null) {
        console.log('exec error: ' + error);
    } else{
        console.log("Background.js file has been moved successfully");
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

exec("mv "+__dirname+"/build/css/*.css "+__dirname+"/build/static/css", function (error, stdout, stderr) {
    if (error !== null) {
        console.log('exec error: ' + error);
    } else{
        console.log("All files in css folder moved to static/css");
    }
});



exec("mv "+__dirname+"/build/css/themes/*.css "+__dirname+"/build/static/css/themes", function (error, stdout, stderr) {
    if (error !== null) {
        console.log('exec error: ' + error);
    } else{
        console.log("All files in css/themes folder moved to static/css/themes");
        exec("rm -rf "+__dirname+"/build/css", function (error, stdout, stderr) {
            if (error !== null) {
                console.log('exec error: ' + error);
            } else{
                console.log("CSS folder has been deleted");
            }
        });
    }
});

exec("mv "+__dirname+"/build/js/*.js "+__dirname+"/build/static/js", function (error, stdout, stderr) {
    if (error !== null) {
        console.log('exec error: ' + error);
    } else{
        console.log("All files in js folder moved to static/js");
        exec("rm -rf "+__dirname+"/build/js", function (error, stdout, stderr) {
            if (error !== null) {
                console.log('exec error: ' + error);
            } else{
                console.log("Js folder has been deleted");
            }
        });
    }
});




