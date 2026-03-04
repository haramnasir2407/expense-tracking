import { CATEGORIES } from "@/constants/categories";
import { getCategories } from "@/service/expenses-supabase";
import { Category } from "@/types/expense";
import { useQuery } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import * as SecureStore from "expo-secure-store";

const EXPENSE_CATEGORIES_KEY = "expense_categories";
const queryKey = ["expense-categories"] as const;

async function fetchCategories(): Promise<Category[]> {
  // If we're offline, skip the network call entirely and go straight
  // to the cached / local categories so the picker still works.
  const netState = await NetInfo.fetch();
  const isOnline =
    netState.isConnected === true && netState.isInternetReachable === true;

  if (isOnline) {
    try {
      const { data, error } = await getCategories();
      if (!error && data) {
        if (data.length > 0) {
          await SecureStore.setItemAsync(
            EXPENSE_CATEGORIES_KEY,
            JSON.stringify(data),
          );
        }
        return data;
      }
    } catch {
      // Fall through to offline cache
    }
  }

  const cached = await SecureStore.getItemAsync(EXPENSE_CATEGORIES_KEY);
  if (cached) {
    console.log("using cached categories");
    try {
      const parsed = JSON.parse(cached) as Category[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // Ignore parse errors
    }
  }
  console.log("using default categories");
  return CATEGORIES.map((c, index) => ({
    id: String(index),
    name: c.name,
    icon: c.icon,
    color: c.color,
  }));
}

export function useExpenseCategories(options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey,
    queryFn: fetchCategories,
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  });

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
