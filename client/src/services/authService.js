import api from "./api";
/**
 * Login user
 * @param {string} email
 * @param {string} password
 */

export const login = async(email,password) => {
    const response = await api.post("/auth/login", { email, password });
    const token = response.data.access_token;
    localStorage.setItem("token", token);
    if (response.data.role) {
        localStorage.setItem("role", response.data.role);
    }
    if (response.data.user_id) {
        localStorage.setItem("user_id", String(response.data.user_id));
    }
    return response.data;
}

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
}

export const isAuthenticated = () => {
    return !!localStorage.getItem("token");
}

export const getToken = () => {
    return localStorage.getItem("token");
}
export const getRole = () => {
    return localStorage.getItem("role");
}

export const getUserId = () => {
    return localStorage.getItem("user_id");
}

/**
 * Request a password reset OTP
 * @param {string} email 
 */
export const requestPasswordReset = async (email) => {
    const response = await api.post("/auth/reset-password-request", null, {
        params: { email }
    });
    return response.data;
};

/**
 * Reset password using OTP
 * @param {string} email 
 * @param {string} otp 
 * @param {string} newPassword 
 */
export const resetPassword = async (email, otp, newPassword) => {
    const response = await api.post("/auth/reset-password", 
        { email, otp }, 
        { params: { new_password: newPassword } }
    );
    return response.data;
};

export const forgotPassword = async(email,otp) => {
    try{
        const response = await api.post("/auth/forgot-password", { email, otp });
        return response.data;
    }
    catch(err){
        console.error("Forgot password error:", err);
        throw err;  
}
}