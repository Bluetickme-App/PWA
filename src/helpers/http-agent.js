const axios = require('axios');

class HttpAgent {

    constructor(baseURL, headers) {
        this.axiosInstance = axios.create({
            baseURL,
            headers,
        });
    }

    post(path, body) {
        return this.axiosInstance.post(path, body);
    }
}

module.exports = HttpAgent;
