const crypto = require('crypto');

const createSecret = () => {
    // node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    const key = crypto.randomBytes(32).toString('hex');
    return key;
};

// console.log(createSecret()); // call the function to generate a secret key

module.exports = createSecret;
