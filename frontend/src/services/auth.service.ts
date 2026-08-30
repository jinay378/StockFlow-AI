import api from "./api";

export interface LoginStepOneResponse {
  requires_otp: boolean;
  temp_token: string;
  masked_email: string;
  masked_phone?: string;
  message: string;
  demo_otp?: string;
}

export interface VerifyOtpResponse {
  message: string;
  access_token: string;
  token_type: string;
  username: string;
  email: string;
  role: string;
  phone?: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  phone?: string;
  role: string;
}

export const login = async (
  email: string,
  password: string
): Promise<LoginStepOneResponse> => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

export const register = async (userData: {
  username: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const verifyOtp = async (
  temp_token: string,
  otp_code: string
): Promise<VerifyOtpResponse> => {
  const response = await api.post("/auth/verify-otp", {
    temp_token,
    otp_code,
  });

  const data = response.data;

  // Save authenticated session
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("username", data.username);
  localStorage.setItem("email", data.email);
  localStorage.setItem("role", data.role ? data.role.toLowerCase() : "staff");

  return data;
};

export const resendOtp = async (
  temp_token: string
): Promise<{ message: string; masked_email: string; masked_phone?: string; demo_otp?: string }> => {
  const response = await api.post("/auth/resend-otp", {
    temp_token,
  });

  return response.data;
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("username");
  localStorage.removeItem("email");
  localStorage.removeItem("token");
  localStorage.removeItem("role");
};

export const getToken = () => {
  return localStorage.getItem("access_token");
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("access_token");
};

export const getUserRole = (): string => {
  return (localStorage.getItem("role") || "staff").toLowerCase();
};

export const isAdmin = (): boolean => getUserRole() === "admin";
export const isManager = (): boolean => ["admin", "manager"].includes(getUserRole());
export const isStaff = (): boolean => getUserRole() === "staff";

/* ===========================
   Profile / Settings
=========================== */

export const getProfile = async (): Promise<UserProfile> => {
  const response = await api.get("/auth/me");
  if (response.data?.role) {
    localStorage.setItem("role", response.data.role.toLowerCase());
  }
  return response.data;
};

export const updateProfile = async (
  username: string
): Promise<UserProfile> => {
  const response = await api.put("/auth/me", { username });
  return response.data;
};

export const changePassword = async (
  oldPassword: string,
  newPassword: string
) => {
  const response = await api.put("/auth/change-password", {
    old_password: oldPassword,
    new_password: newPassword,
  });
  return response.data;
};

/* ===========================
   Team Management (Admin)
=========================== */

export interface TeamMember {
  id: number;
  username: string;
  email: string;
  phone?: string;
  role: "admin" | "manager" | "staff";
  is_owner: boolean;
}

export const getTeamMembers = async (): Promise<TeamMember[]> => {
  const response = await api.get("/auth/team");
  return response.data;
};

export const addTeamMember = async (memberData: {
  username: string;
  email: string;
  password: string;
  phone?: string;
  role: string;
}) => {
  const response = await api.post("/auth/team", memberData);
  return response.data;
};

export const updateTeamMemberRole = async (memberId: number, role: string) => {
  const response = await api.put(`/auth/team/${memberId}/role`, { role });
  return response.data;
};

export const removeTeamMember = async (memberId: number) => {
  const response = await api.delete(`/auth/team/${memberId}`);
  return response.data;
};

/* ===========================
   Forgot / Reset Password
=========================== */

export interface ForgotPasswordResponse {
  message: string;
  reset_token: string;
  masked_email: string;
  demo_otp?: string;
}

export const forgotPassword = async (
  email: string
): Promise<ForgotPasswordResponse> => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resendResetOtp = async (
  reset_token: string
): Promise<{ message: string; masked_email: string; demo_otp?: string }> => {
  const response = await api.post("/auth/resend-reset-otp", { reset_token });
  return response.data;
};

export const resetPassword = async (
  reset_token: string,
  otp_code: string,
  new_password: string
): Promise<{ message: string }> => {
  const response = await api.post("/auth/reset-password", {
    reset_token,
    otp_code,
    new_password,
  });
  return response.data;
};


