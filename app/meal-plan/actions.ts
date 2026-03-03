"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const mealSlotSchema = z.object({
  breakfast: z.string().nullable(),
  lunch: z.string().nullable(),
  dinner: z.string().nullable(),
});

const mealsSchema = z.record(z.string(), mealSlotSchema);

export type MealPlanActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function saveMealPlan(
  _prevState: MealPlanActionState,
  formData: FormData,
): Promise<MealPlanActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) {
    return {
      status: "error",
      message: "You must be signed in to save a meal plan.",
    };
  }

  const weekStart = String(formData.get("week_start") ?? "").trim();
  const mealsRaw = String(formData.get("meals") ?? "{}");

  const parsedMeals = JSON.parse(mealsRaw);
  const normalizedMeals = Object.fromEntries(
    Object.entries(parsedMeals).map(([key, value]) => {
      if (typeof value === "string") {
        try {
          return [key, JSON.parse(value)];
        } catch {
          return [key, value];
        }
      }
      return [key, value];
    }),
  );

  const meals = mealsSchema.safeParse(normalizedMeals);
  if (!meals.success) {
    return {
      status: "error",
      message: "We couldn’t save your plan. Please try again.",
    };
  }

  const { data: existingPlan, error: findError } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("user_id", user.id)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (findError) {
    return { status: "error", message: findError.message };
  }

  if (existingPlan?.id) {
    const { error } = await supabase
      .from("meal_plans")
      .update({ meals: meals.data })
      .eq("id", existingPlan.id)
      .eq("user_id", user.id);

    if (error) {
      return { status: "error", message: error.message };
    }
  } else {
    const { error } = await supabase.from("meal_plans").insert({
      user_id: user.id,
      week_start: weekStart,
      meals: meals.data,
    });

    if (error) {
      return { status: "error", message: error.message };
    }
  }

  revalidatePath("/meal-plan");
  return { status: "success", message: "Meal plan saved." };
}
