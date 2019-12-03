const program = require('commander');
const httpProxy = require('http-proxy');
const logger = require('./log');

main();

function main() {
    program
        .version('1.0.0')
        .name('simple-http-proxy')
        .usage('-t https://your-domain.com')
        .option('-t, --target <hostname>', 'target host to proxy requests to',)
        .option('-p, --port <port>', 'local port to run the proxy on', parseInt, '5000')
        .option('--changeOrigin', 'change the origin of the host header to the target')
        .parse(process.argv);
    
    if (!validateParams(program)) {
        process.exit(1);
    }

    startProxy({
        target: program.target,
        changeOrigin: program.changeOrigin,
        port: program.port
    });

    logger.logInfo('Proxy server started.')
}

function validateParams(program) {
    if(typeof program.target !== 'string' || program.target.length < 1) {
        logger.logError('A target hostname is required.')
        return false;
    }

    return true;
}

function startProxy(opts) {
    logger.logInfo('Staring a proxy with the following config: \n', opts)
    const { target, changeOrigin, port } = opts;
    const server = httpProxy.createProxyServer({
        target: target,
        changeOrigin: changeOrigin
    });

    server.on('proxyReq', (proxyReq, req, res) => {
        const toLog = [
            'proxy request:', 
            req.method, 
            req.url
        ];

        req.on('end', () => {
            logger.logInfo(...toLog);
        });
    });

    server.on('proxyRes', (proxyRes, req, res) => {
        const toLog = [
            'proxy response:', 
            proxyRes.statusCode
        ];

        proxyRes.on('end', () => {
            logger.logInfo(...toLog);
        });
    });
        
    server.listen(port);
    return server;
}