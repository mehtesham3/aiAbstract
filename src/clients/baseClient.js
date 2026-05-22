import axios from "axios"
import normalizeVendorError from "../utils/errorNormalizer.js";

class baseClient {

    constructor(config = {}) {
        // axios instance create 
        this.client = axios.create({
            timeout: config.timeout || 10000, // 10 sec timeout for external API call 
            headers: config.headers || {},
            baseURL: config.baseURL || ""
        })
        //vendor info store for error tracking
        this.vendor = config.provider || "unknown";
        //setup request and response interceptors for logging and error handling
        this.setupInterceptor();
    }
    setupInterceptor() {
        //Request interceptor
        this.client.interceptors.request.use((config) => {
            config.meta = { startTime: Date.now() };
            console.log(`\n Outgoing request to ${this.vendor}`);
            console.log(`URL: ${config.url}`);
            console.log(`Headers: ${JSON.stringify(config.headers, null, 2)}`);
            if (config.data) {
                console.log(`Body: ${JSON.stringify(config.data, null, 2)}`);
            }
            console.log(`Timestamp: ${new Date().toISOString()}`);

            config.headers['x-Request-ID'] = `${this.vendor}-${Date.now()}`;

            return config;
        }, (error) => {
            const normalizeError = normalizeVendorError(error, this.vendor);
            console.error(`[${this.vendor}] Request Interceptor Error`, normalizeError.message);
            return Promise.reject(normalizeError) //this is for rejecting the error to the caller
            // throw normalizeError; //this is for throwing the error to the caller
        },
        );

        this.client.interceptors.response.use((response) => {
            const duration = Date.now() - response.config.meta.startTime;
            console.log(`Incoming response from ${this.vendor} (${duration}ms)`);
            console.log(`Status: ${response.status}`);
            console.log(`Data: ${JSON.stringify(response.data, null, 2)}`);
            console.log(`Timestamp: ${new Date().toISOString()}`);
        }, (error) => {
            const normalizeError = normalizeVendorError(error, this.vendor);

            let failReason = 'Unknown Error';
            let statusCode = null;

            if (error.response) {
                statusCode = error.response.status;
                failReason = this.categorizeErrorStatus(statusCode);
            } else if (error.request) {
                failReason = this.categorizeNetworkError(error.code);
            } else {
                failReason = 'Request configuration Error';
            }
            return Promise.reject(normalizeError);
        })

    }

    categorizeErrorStatus(status) {
        if (status === 400) return 'Bad Request - Invalid Payload';
        if (status === 401) return 'Unauthorized - Invalid Credentials';
        if (status === 403) return 'Forbidden - Access Denied';
        if (status === 404) return 'Not Found - Resource Missing';
        if (status === 429) return 'Rate Limited - Too Many Requests';
        if (status >= 500) return 'Server Error - Vendor Issue';
        return `HTTP ${status} Error`;
    }

    categorizeNetworkError(code) {
        if (code === 'ENOTFOUND') return 'DNS Lookup Failed';
        if (code === 'ECONNREFUSED') return 'Connection Refused';
        if (code === 'ETIMEDOUT') return 'Request Timeout';
        if (code === 'ECONNABORTED') return 'Request Aborted';
        if (code === 'ECONNRESET') return 'Connection Reset';
        return 'Network Error';
    }
    async callExternalAPI({ method, url, data = null, headers = {} }) {
        try {
            const config = {
                method: method.toLowerCase(),
                url,
                data,
                headers,
                ...(data && { data })
            };
            const response = await this.client.request(config)
            return response.data;

        } catch (error) {
            throw normalizeVendorError(error, this.vendor);
        };
    };

    async get(url, headers = {}) {
        return this.callExternalAPI({ method: 'GET', url, headers })
    }
    async post(url, data, headers = {}) {
        return this.callExternalAPI({ method: 'POST', url, data, headers })
    }
    async put(url, data, headers = {}) {
        return this.callExternalAPI({ method: 'PUT', url, data, headers })
    }
    async patch(url, data, headers = {}) {
        return this.callExternalAPI({ method: 'PATCH', url, data, headers })
    }
    async delete(url, headers = {}) {
        return this.callExternalAPI({ method: 'DELETE', url, headers })
    }

}

export default baseClient;