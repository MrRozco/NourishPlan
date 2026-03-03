export type MealSlot = "breakfast" | "lunch" | "dinner";

export interface MealPlanMeals {
  [day: string]: {
    breakfast: string | null;
    lunch: string | null;
    dinner: string | null;
  };
}

export interface MealPlan {
  id: string;
  user_id: string;
  week_start: string;
  meals: MealPlanMeals;
  created_at: string;
}
