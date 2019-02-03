const log = require('winston');
const db = require('@ampapps/pdrc-db');
require('@ampapps/pdrc-env');

module.exports = async() => {
    try {
        await db.init();
        log.info('Generate report data task succeeded');
        db.close();
    } catch (err) {
        log.error(err);
    }
};
