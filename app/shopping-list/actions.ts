"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const ingredientSchema = z.object({
  name: z.string(),
  amount: z.number().optional(),
  unit: z.string().optional(),
});

const mealsSchema = z.record(
  z.string(),
  z.object({
    breakfast: z.string().nullable(),
    lunch: z.string().nullable(),
    dinner: z.string().nullable(),
  }),
);

export interface ShoppingListItem {
  name: string;
  amount?: number;
  unit?: string;
}

export interface ShoppingListGroup {
  category: string;
  items: ShoppingListItem[];
}

export async function generateShoppingList(weekStart: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (!user) {
    throw new Error("You must be signed in to generate a shopping list.");
  }

  const { data: plan, error: planError } = await supabase
    .from("meal_plans")
    .select("meals")
    .eq("user_id", user.id)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (planError || !plan?.meals) {
    throw new Error("No meal plan found for that week.");
  }

  const meals = mealsSchema.parse(plan.meals);
  const recipeIds = new Set<string>();
  Object.values(meals).forEach((day) => {
    if (day.breakfast) recipeIds.add(day.breakfast);
    if (day.lunch) recipeIds.add(day.lunch);
    if (day.dinner) recipeIds.add(day.dinner);
  });

  if (recipeIds.size === 0) {
    return [] as ShoppingListGroup[];
  }

  const { data: recipes, error: recipeError } = await supabase
    .from("recipes")
    .select("ingredients")
    .in("id", Array.from(recipeIds));

  if (recipeError) {
    throw new Error(recipeError.message);
  }

  const ingredients = (recipes ?? [])
    .flatMap((recipe: any) => recipe.ingredients ?? [])
    .map((ingredient: any) => ingredientSchema.parse(ingredient));

  const grouped = new Map<string, ShoppingListItem[]>();

  ingredients.forEach((ingredient) => {
    const name = ingredient.name.trim();
    if (!name) return;
    const key = name.toLowerCase();
    const current = grouped.get(key) ?? [];
    current.push({
      name,
      amount: ingredient.amount,
      unit: ingredient.unit,
    });
    grouped.set(key, current);
  });

  const list = Array.from(grouped.values()).map((items) => items[0]);
  list.sort((a, b) => a.name.localeCompare(b.name));

  return [
    {
      category: "All ingredients",
      items: list,
    },
  ];
}
