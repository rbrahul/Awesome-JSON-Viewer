import { createServer } from 'node:http';
import { readFile } from 'fs/promises';

const createURLFromReqURl = (urlPart) => {
    return new URL(`http://localhost${urlPart}`);
};

const proecesRequests = (routes, req, res) => {
    const url = createURLFromReqURl(req.url);
    let found = false;
    routes = routes.sort((a, b) => b - a);
    routes.forEach(({ path, method, cb }) => {
        if (method === req.method && url.pathname == path) {
            found = true;
            return cb({ ...req, parsedUrl: url }, res);
        }
    });
    if (!found) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        const reqObj = JSON.stringify(url, null, 4);
        res.end(
            `<h1>404: Notfound</h1><p> No route has been registered</p><pre>${reqObj}</pre>`,
        );
    }
};

const initialiseServer = () => {
    const registeredRoutes = [];

    const requestHandler = async (req, res) => {
        proecesRequests(registeredRoutes, req, res);
    };

    const server = createServer(requestHandler);

    const utils = {
        registerPath(method, path, cb) {
            registeredRoutes.push({
                path,
                method,
                cb,
            });
        },
        get(path, cb) {
            this.registerPath('GET', path, cb);
        },
        post(path, cb) {
            this.registerPath('POST', path, cb);
        },
        listen(port, host, cb) {
            server.listen(port, host, cb);
        },
    };
    return utils;
};

const app = initialiseServer();

const render = async (res, filePath, statusCode = 200, ctype = 'text/html') => {
    const data = await readFile(filePath, {
        encoding: 'utf8',
    });
    res.writeHead(statusCode, { 'Content-Type': ctype });
    res.end(data);
};

app.get('/', (_, res) => {
    return render(res, './src/testserver/index.html');
});

app.get('/api', async (req, res) => {
    const data = await readFile('./src/testserver/dummy.json', {
        encoding: 'utf8',
    });

    const contentType = {
        'Content-Type':
            decodeURIComponent(req.parsedUrl.searchParams?.get('ctype')) ||
            'text/html',
    };
    res.writeHead(200, contentType);
    const dataToRespond = {
        ...contentType,
        data: JSON.parse(data),
    };
    return res.end(JSON.stringify(dataToRespond, null, 4));
});

app.listen(3000, '127.0.0.1', () => {
    console.log('Listening on http://127.0.0.1:3000');
});
