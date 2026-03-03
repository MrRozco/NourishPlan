import { createBrowserClient } from "@/lib/supabase";
import type { MealPlan } from "@/types/meal-plan";

export async function fetchMealPlans(): Promise<MealPlan[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("meal_plans")
    .select("*")
    .order("week_start", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as MealPlan[];
}
