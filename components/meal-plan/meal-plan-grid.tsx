/*
// Aesthetic: sleek, colorful, wellness-focused – vibrant greens/oranges, fresh feel, sophisticated health & nutrition vibe
Project Overview: NourishPlan
A modern recipe manager and meal planner with AI assistance.
• Users save personal recipes (title, ingredients, instructions, prep/cook time, servings, optional photo).
• Create weekly meal plans (7 days × 3 meals: breakfast/lunch/dinner).
• Generate shopping lists from selected meals.
• AI features powered by Grok:
– Input ingredients on hand → suggest matching recipes
– Generate nutritional summaries for recipes/meals
– Suggest ingredient substitutions
• Routes: / (landing + sign-in), /dashboard (overview), /recipes (list + create), /recipes/[id] (detail), /meal-plan (weekly planner), /shopping-list
Tech Stack
• Next.js 15 (App Router, Server Components default, Server Actions for mutations)
• TypeScript (strict mode)
• Tailwind CSS + shadcn/ui
• Supabase (auth, Postgres, realtime for meal-plan updates if collaborative later)
• Zod (validation)
• sonner (toasts)
• lucide-react (icons)
• date-fns (dates)
• framer-motion (smooth animations)
• Optional: next-cloudinary or Supabase Storage for recipe images
Coding & Design Standards
• Server Components by default; Server Actions for all mutations
• Supabase client for all database operations
• Strict TypeScript interfaces for every model
• Modular, reusable components
• Full error handling, optimistic UI updates, user-friendly toasts
• Row Level Security (RLS) on all tables
• JSDoc + meaningful inline comments
• Tests after each phase: manual verification steps + Vitest for key logic
• UI/UX override: every screen and component must feel sleek, colorful, appealing, and wellness-oriented — or it is incorrect
• Dark mode: elegant dark variant (deep greens, warm dark corals, high-contrast accents)
Workflow Rules
• Structure every response exactly as:

PHASE X: [Name]
User Actions: (numbered list — if none write: "None – proceed to Agent Actions.")
Agent Actions: (your code generation, refactoring, integration work)
If waiting for user: "WAITING FOR USER CONFIRMATION: [precise instructions]. Reply exactly: 'Setup complete' when finished."
After confirmation: Execute verification tests (manual steps + any Vitest) to confirm correct pipework (auth → db → ui → api)
End phase with: "PHASE X COMPLETE – Ready for next phase."
• Never advance to the next phase without explicit user confirmation.
• Suggest terminal commands inside code blocks.
*/
"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import type { MealPlanMeals } from "@/types/meal-plan";
import type { Recipe } from "@/types/recipe";
import type { MealPlanActionState } from "@/app/meal-plan/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface MealPlanDay {
  key: string;
  label: string;
}

interface MealPlanGridProps {
  days: MealPlanDay[];
  recipes: Array<Pick<Recipe, "id" | "title">>;
  initialMeals: MealPlanMeals;
  weekStart: string;
  action: (
    prevState: MealPlanActionState,
    formData: FormData,
  ) => Promise<MealPlanActionState>;
}

const mealSlots = ["breakfast", "lunch", "dinner"] as const;

export function MealPlanGrid({
  days,
  recipes,
  initialMeals,
  weekStart,
  action,
}: MealPlanGridProps) {
  const [state, formAction] = React.useActionState<MealPlanActionState, FormData>(
    action,
    { status: "idle" },
  );

  const normalizedInitialMeals = React.useMemo(() => {
    return Object.fromEntries(
      Object.entries(initialMeals).map(([key, value]) => {
        if (typeof value === "string") {
          try {
            const parsed = JSON.parse(value);
            if (parsed && typeof parsed === "object") {
              return [key, parsed];
            }
          } catch {
            // fall through to default
          }
          return [key, { breakfast: null, lunch: null, dinner: null }];
        }
        return [key, value];
      })
    ) as MealPlanMeals;
  }, [initialMeals]);

  const [meals, setMeals] = React.useState<MealPlanMeals>(
    normalizedInitialMeals
  );

  React.useEffect(() => {
    setMeals(normalizedInitialMeals);
  }, [normalizedInitialMeals]);

  React.useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Meal plan saved.");
    }
    if (state.status === "error") {
      toast.error(state.message ?? "Unable to save meal plan.");
    }
  }, [state]);

  const handleChange = (
    dayKey: string,
    slot: (typeof mealSlots)[number],
    value: string
  ) => {
    setMeals((current) => ({
      ...current,
      [dayKey]: {
        ...(typeof current[dayKey] === "string"
          ? { breakfast: null, lunch: null, dinner: null }
          : current[dayKey]),
        [slot]: value || null,
      },
    }));
  };

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="week_start" value={weekStart} />
      <input type="hidden" name="meals" value={JSON.stringify(meals)} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {days.map((day) => (
          <Card key={day.key} className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                {day.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mealSlots.map((slot) => (
                <div key={slot} className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-foreground/60">
                    {slot}
                  </Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    value={meals[day.key]?.[slot] ?? ""}
                    onChange={(event) =>
                      handleChange(day.key, slot, event.target.value)
                    }
                  >
                    <option value="">No selection</option>
                    {recipes.map((recipe) => (
                      <option key={recipe.id} value={recipe.id}>
                        {recipe.title}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card px-6 py-4 shadow-sm">
        <div>
          <p className="text-sm font-semibold">Nutrition snapshot</p>
          <p className="text-xs text-foreground/60">
            Placeholder estimates will appear here once calculations are wired.
          </p>
        </div>
        <Button type="submit">Save weekly plan</Button>
      </div>
    </form>
  );
}
