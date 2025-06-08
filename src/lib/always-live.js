const cron = require('node-cron');
const axios = require('axios');

const alwaysLive = () => {
    const url = process.env.DOMAIN;

    cron.schedule('*/9 * * * *', async () => {
        await axios.get(url);
    });
};

module.exports = alwaysLive;
