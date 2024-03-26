const { execSync } = require('child_process');
const { copyFile, readFile, writeFile} = require('fs/promises');


const moveFilesToPublicDir = () => {
    const files = {
        '/build/static/js/main*.js': '/js/main.js',
        '/build/static/css/main*.css': '/css/main.css',
    };

    for(const [key, value] of Object.entries(files)) {
        try {
            execSync(`mv ${__dirname}${key} ${__dirname}/public/${value}`);
        } catch (error) {
            console.log("ERROR:", error.toString());
        }
    }
}

/** REMOVE HASH FROM INDEX.html from style.css and main.js */
const indexHTMLInBuild = __dirname + '/build/index.html';

(async () => {
    moveFilesToPublicDir();

    // replace file naming hash from index.html
    const data = await readFile(indexHTMLInBuild);
    let text = data.toString();
    text = text.replace(/main\.(?:.)+\.(js|css)"/g, (_, $1) => {
        return `main.${$1}"`;
    });
    text = text.replace(/\/static/g, '');

    await writeFile(indexHTMLInBuild, text)
    console.log('Removed file naming Hash from build/index.html');

    await copyFile(indexHTMLInBuild, __dirname+'/public/index.html')
    console.log('Copied build/index.html to public/index.html');

    // delete build directory after copying files
    try {
        execSync('rm -rf ' + __dirname + '/build/static');
        console.log('build/static has been deleted successfully');
    } catch (error) {
        console.log('exec error: ' + error);
    }
})();
