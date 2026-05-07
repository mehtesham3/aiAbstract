// src/utils/errorNormalizer.js

class NormalizedError {
    constructor({
        success = false,
        vendor,
        errorType,
        code,
        message,
        statusCode = null,
        retryable = false,
        retryAfter = null,
        originalError = null
    }) {
        this.success = success;
        this.vendor = vendor;
        this.errorType = errorType;
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
        this.retryable = retryable;
        this.retryAfter = retryAfter;
        this.originalError = originalError;
        this.timestamp = new Date().toISOString();
    }
}

/**
 * Normalize vendor errors into a standard format
 * @param {Error} error - The error object from axios/vendor
 * @param {string} vendor - Vendor name (e.g., 'openai', 'resend')
 * @returns {NormalizedError}
 */

export function normalizeVendorError(error, vendor) {

    // Case 1: VENDOR RESPONSE ERROR (4xx, 5xx)
    if (error.response) {
        return normalizeResponseError(error, vendor);
    }

    // Case 2: NETWORK ERROR (no response received)
    if (error.request) {
        return normalizeNetworkError(error, vendor);
    }

    // Case 3: REQUEST SETUP ERROR
    return normalizeConfigError(error, vendor);
}

/**
 * Handle errors where server responded with status code
 */
function normalizeResponseError(error, vendor) {
    const status = error.response.status;
    const data = error.response.data;

    // Get retry-after header for rate limits
    const retryAfter = error.response.headers['retry-after']
        ? parseInt(error.response.headers['retry-after'])
        : null;

    // Categorize by status code
    switch (status) {
        case 400:
            return new NormalizedError({
                vendor,
                errorType: 'BAD_REQUEST',
                code: 'INVALID_PAYLOAD',
                message: extractVendorMessage(data) || 'Invalid request payload',
                statusCode: 400,
                retryable: false,
                originalError: data
            });

        case 401:
            return new NormalizedError({
                vendor,
                errorType: 'AUTHENTICATION_ERROR',
                code: 'INVALID_CREDENTIALS',
                message: extractVendorMessage(data) || 'Authentication failed - check API key',
                statusCode: 401,
                retryable: false,
                originalError: data
            });

        case 403:
            return new NormalizedError({
                vendor,
                errorType: 'AUTHORIZATION_ERROR',
                code: 'ACCESS_DENIED',
                message: extractVendorMessage(data) || 'Access denied - insufficient permissions',
                statusCode: 403,
                retryable: false,
                originalError: data
            });

        case 404:
            return new NormalizedError({
                vendor,
                errorType: 'NOT_FOUND',
                code: 'RESOURCE_NOT_FOUND',
                message: extractVendorMessage(data) || 'Resource not found',
                statusCode: 404,
                retryable: false,
                originalError: data
            });

        case 422:
            return new NormalizedError({
                vendor,
                errorType: 'VALIDATION_ERROR',
                code: 'VALIDATION_FAILED',
                message: extractVendorMessage(data) || 'Request validation failed',
                statusCode: 422,
                retryable: false,
                originalError: data
            });

        case 429:
            return new NormalizedError({
                vendor,
                errorType: 'RATE_LIMIT_ERROR',
                code: 'TOO_MANY_REQUESTS',
                message: `Rate limit exceeded${retryAfter ? ` - retry after ${retryAfter}s` : ''}`,
                statusCode: 429,
                retryable: true,
                retryAfter,
                originalError: data
            });

        case 500:
        case 502:
        case 503:
        case 504:
            return new NormalizedError({
                vendor,
                errorType: 'SERVER_ERROR',
                code: `HTTP_${status}`,
                message: 'Vendor server error - try again later',
                statusCode: status,
                retryable: true,
                originalError: data
            });

        default:
            return new NormalizedError({
                vendor,
                errorType: 'UNKNOWN_HTTP_ERROR',
                code: `HTTP_${status}`,
                message: `Unexpected HTTP status: ${status}`,
                statusCode: status,
                retryable: status >= 500,
                originalError: data
            });
    }
}

/**
 * Handle network errors (no response received)
 */
function normalizeNetworkError(error, vendor) {
    const code = error.code;

    switch (code) {
        case 'ENOTFOUND':
            return new NormalizedError({
                vendor,
                errorType: 'DNS_ERROR',
                code: 'DNS_LOOKUP_FAILED',
                message: 'Domain not found - check URL configuration',
                retryable: false,
                originalError: { code, message: error.message }
            });

        case 'ECONNREFUSED':
            return new NormalizedError({
                vendor,
                errorType: 'CONNECTION_ERROR',
                code: 'CONNECTION_REFUSED',
                message: 'Connection refused - server may be down',
                retryable: true,
                originalError: { code, message: error.message }
            });

        case 'ETIMEDOUT':
        case 'ECONNABORTED':
            return new NormalizedError({
                vendor,
                errorType: 'TIMEOUT_ERROR',
                code: 'REQUEST_TIMEOUT',
                message: 'Request timeout - vendor too slow or unreachable',
                retryable: true,
                originalError: { code, message: error.message }
            });

        case 'ECONNRESET':
            return new NormalizedError({
                vendor,
                errorType: 'CONNECTION_ERROR',
                code: 'CONNECTION_RESET',
                message: 'Connection lost mid-request',
                retryable: true,
                originalError: { code, message: error.message }
            });

        default:
            return new NormalizedError({
                vendor,
                errorType: 'NETWORK_ERROR',
                code: code || 'UNKNOWN_NETWORK_ERROR',
                message: error.message || 'Network request failed',
                retryable: true,
                originalError: { code, message: error.message }
            });
    }
}

/**
 * Handle request configuration errors
 */
function normalizeConfigError(error, vendor) {
    return new NormalizedError({
        vendor,
        errorType: 'CONFIG_ERROR',
        code: 'REQUEST_SETUP_FAILED',
        message: error.message || 'Request configuration error',
        retryable: false,
        originalError: { message: error.message }
    });
}

/**
 * Extract error message from different vendor response formats
 */
function extractVendorMessage(data) {
    if (!data) return null;

    // OpenAI ,Google GenAI ,Groq format: { error: { message: "..." } }
    if (data.error?.message) return data.error.message;

    // //Google GenAi format: { error: { message: "..." } }
    // if (data.error?.message) return data.error.message;

    //Generic message field
    if (typeof data === 'string') return data;

    return null;
}

export default normalizeVendorError;

//Integrate with baseClient of DAY3 