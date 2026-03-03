import { createBrowserClient } from "@/lib/supabase";
import type { Recipe } from "@/types/recipe";

export async function fetchRecipes(): Promise<Recipe[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Recipe[];
}
