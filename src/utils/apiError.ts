// The API sends failures as 4xx/5xx with { success: 0, message }, so axios throws
// and the message is on error.response. A few older endpoints use `msg`.
export const getApiError = (error: any, fallback = 'Something went wrong. Please try again.'): string =>
    error?.response?.data?.message || error?.response?.data?.msg || fallback;

// Same rules as utils/validators.js in the backend. Returns the problem, or null when valid.
export const getPasswordError = (password: string): string | null => {
    if (password.length < 8 || password.length > 72) {
        return 'Password must be 8 to 72 characters long';
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
        return 'Password must include an uppercase letter, a lowercase letter, a number and a special character';
    }
    return null;
};
