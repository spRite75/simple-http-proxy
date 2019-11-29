function logInfo(...msg) {
    console.log('INFO: ', ...msg);
}

function logError(...msg) {
    console.log('ERROR: ', ...msg);
}

module.exports.logError = logError;
module.exports.logInfo = logInfo;