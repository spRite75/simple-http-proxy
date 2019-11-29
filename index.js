const program = require('commander');
const httpProxy = require('http-proxy');
const logger = require('./log');


main();

function main() {
    program
        .version('1.0.0')
        .option('-t, --target <hostname>', 'target host to proxy requests to',)
        .option('-p, --port <port>', 'local port to run the proxy on', parseInt, '5000')
        .option('--changeOrigin', 'change the origin of the host header to the target')
        .option('--logNonJSONResponses', 'always try to log the response, even if it isn\'t a valid object')
        .parse(process.argv);
    
    if (!validateParams(program)) {
        process.exit(1);
    }

    startProxy({
        target: program.target,
        changeOrigin: program.changeOrigin,
        port: program.port,
        logNonJSONResponses: program.logNonJSONResponses
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
    const { target, changeOrigin, port, logNonJSONResponses } = opts;
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

        const bodyChunks = [];

        req.on('data', (chunk) => {
            bodyChunks.push(chunk.toString());
        });

        req.on('end', () => {
            if (bodyChunks.length > 0) {
                try {
                    toLog.push('\n body:', JSON.parse(bodyChunks.join('')));
                } catch {
                    toLog.push('\n body:', bodyChunks.join(''));
                }
            }
            logger.logInfo(...toLog);
        });
    });

    server.on('proxyRes', (proxyRes, req, res) => {
        const toLog = [
            'proxy response:', 
            proxyRes.statusCode
        ];

        const bodyChunks = [];

        proxyRes.on('data', (chunk) => {
            bodyChunks.push(chunk.toString());
        });

        proxyRes.on('end', () => {
            if (bodyChunks.length > 0) {
                try {
                    toLog.push('\n body:', JSON.parse(bodyChunks.join('')));
                } catch {
                    toLog.push('\n body:', bodyChunks.join(''));
                }
            }
            logger.logInfo(...toLog);
        });
    });
        
    server.listen(port);
    return server;
}