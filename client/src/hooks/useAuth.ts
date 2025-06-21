import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    user: data?.user || null,
    isLoading,
    isAuthenticated: !!data?.user,
    error
  };
}