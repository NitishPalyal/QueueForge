import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  authApi,
  type LoginPayload,
  type RegisterPayload,
} from "../api/authApi";
import { useAuthStore } from "../state/useAuthStore";
import { queryClient } from "../../../shared/lib/queryClient";
import { toast } from "sonner";

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isCheckingAuth,
    setUser,
    setIsCheckingAuth,
    logout: storeLogout,
  } = useAuthStore();

  // Session Restoration Query on Load
  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.getMe,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (meQuery.isSuccess && meQuery.data) {
      setUser(meQuery.data);
    } else if (meQuery.isError) {
      // Only unset user if the backend definitively returns 401
      const status = (meQuery.error as any)?.response?.status;
      if (status === 401) {
        setUser(null);
      } else {
        setIsCheckingAuth(false);
      }
    }
  }, [
    meQuery.isSuccess,
    meQuery.isError,
    meQuery.data,
    meQuery.error,
    setUser,
    setIsCheckingAuth,
  ]);

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setUser(data);
      queryClient.setQueryData(["auth", "me"], data);
      toast.success("Welcome back!", {
        description: `Logged in as ${data.fullname}`,
      });
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message || error.message || "Login failed";
      toast.error("Login Error", { description: msg });
    },
  });

  // Register Mutation
  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (data) => {
      setUser(data);
      queryClient.setQueryData(["auth", "me"], data);
      toast.success("Registration successful!", {
        description: `Account created for ${data.email}`,
      });
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message || error.message || "Registration failed";
      toast.error("Registration Error", { description: msg });
    },
  });

  // Logout Action
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error: any) {
      const msg =
        error.response?.data?.message || error.message || "Logout failed";
      toast.error("Logout Error", { description: msg });
    } finally {
      storeLogout();
      queryClient.clear();
      toast.info("Logged out successfully");
    }
  };

  return {
    user,
    isAuthenticated,
    isCheckingAuth: !user && meQuery.isLoading && isCheckingAuth,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout,
  };
};
