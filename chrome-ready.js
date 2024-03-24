const { execSync } = require('child_process');
const { copyFile, readFile, writeFile } = require('fs/promises');

execSync(
    'mv ' +
        __dirname +
        '/build/static/js/main*.js ' +
        __dirname +
        '/build/js/main.js',
    function (error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        } else {
            console.log('Main.js file has been generated successfully');
        }
    },
);

execSync(
    'mv ' +
        __dirname +
        '/build/static/css/main*.css ' +
        __dirname +
        '/build/css/main.css',
    function (error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        } else {
            console.log('Main.css file has been generated successfully');
        }
    },
);

execSync('rm -rf ' + __dirname + '/build/static ', function (
    error,
    stdout,
    stderr,
) {
    if (error !== null) {
        console.log('exec error: ' + error);
    } else {
        console.log('build/static has been deleted successfully');
    }
});

['asset-manifest.json'].forEach((file) => {
    execSync('rm -f ' + __dirname + '/build/' + file, function (
        error,
        stdout,
        stderr,
    ) {
        if (error !== null) {
            console.log('exec error: ' + error);
        } else {
            console.log('Unecessery files have been deleted successfully');
        }
    });
});

/** REMOVE HASH FROM INDEX.html from style.css and main.js */
const indexHTMLInBuild = __dirname + '/build/index.html';

(async () => {
    const data = await readFile(indexHTMLInBuild);
    let text = data.toString();
    text = text.replace(/main\.(?:.)+\.(js|css)"/g, (_, $1) => {
        return `main.${$1}"`;
    });
    text = text.replace(/\/static/g, '');

    await writeFile(indexHTMLInBuild, text)
    console.log('Removed file naming Hash from build/index.html');

    await copyFile(indexHTMLInBuild, __dirname+'/public/index.html')
})();
