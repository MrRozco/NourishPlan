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
import Link from "next/link";
import { Suspense } from "react";
import { addDays, format, parseISO, startOfWeek } from "date-fns";

import { createClient } from "@/lib/supabase/server";
import { MealPlanGrid } from "@/components/meal-plan/meal-plan-grid";
import { saveMealPlan } from "@/app/meal-plan/actions";
import { Card, CardContent } from "@/components/ui/card";

interface MealPlanPageProps {
  searchParams: Promise<{ week?: string }>;
}

async function MealPlanContent({ searchParams }: MealPlanPageProps) {
  const supabase = await createClient();
  const { week } = await searchParams;
  const resolvedWeekStart = week && !Number.isNaN(Date.parse(week)) ? week : null;
  const weekStartDate = resolvedWeekStart
    ? parseISO(resolvedWeekStart)
    : startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekStart = format(weekStartDate, "yyyy-MM-dd");

  const { data: recipes, error: recipeError } = await supabase
    .from("recipes")
    .select("id, title")
    .order("created_at", { ascending: false });

  const { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("meals")
    .eq("week_start", weekStart)
    .maybeSingle();

  const { data: savedPlans } = await supabase
    .from("meal_plans")
    .select("id, week_start, meals")
    .order("week_start", { ascending: false });

  if (recipeError) {
    return (
      <Card className="border-border/60 bg-destructive/10">
        <CardContent className="py-6 text-sm text-destructive">
          We couldn&apos;t load your recipes. Please try again.
        </CardContent>
      </Card>
    );
  }

  const days = Array.from({ length: 7 }).map((_, index) => {
    const date = addDays(weekStartDate, index);
    return {
      key: format(date, "yyyy-MM-dd"),
      label: format(date, "EEE, MMM d"),
    };
  });

  const initialMeals = days.reduce((acc, day) => {
    acc[day.key] = mealPlan?.meals?.[day.key] ?? {
      breakfast: null,
      lunch: null,
      dinner: null,
    };
    return acc;
  }, {} as Record<string, { breakfast: string | null; lunch: string | null; dinner: string | null }>);

  return (
    <div className="space-y-8">
      <section className="space-y-3" id="saved-plans">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">Saved meal plans</h2>
            <p className="text-sm text-foreground/70">
              Jump back to any week and keep planning with ease.
            </p>
          </div>
          <Link href="#planner" className="text-sm font-medium text-primary">
            Go to planner
          </Link>
        </div>
        {savedPlans && savedPlans.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {savedPlans.map((plan) => {
              const totalSlots = 21;
              const filledSlots = plan.meals
                ? Object.values(plan.meals).reduce<number>(
                    (count, day: any) =>
                      count +
                      (day?.breakfast ? 1 : 0) +
                      (day?.lunch ? 1 : 0) +
                      (day?.dinner ? 1 : 0),
                    0,
                  )
                : 0;

              return (
                <Card
                  key={plan.id}
                  className="border-border/60 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <CardContent className="flex items-center justify-between py-4">
                    <Link
                      href={`/meal-plan?week=${plan.week_start}`}
                      className="block"
                    >
                      <div>
                        <p className="text-sm font-semibold">Week of</p>
                        <p className="text-sm text-foreground/70">
                          {format(parseISO(plan.week_start), "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-foreground/60">
                          {filledSlots} of {totalSlots} meals planned
                        </p>
                      </div>
                    </Link>
                    <Link
                      href={`/shopping-list?week=${plan.week_start}`}
                      className="text-xs text-primary"
                    >
                      Shopping list
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-border/60 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
            <CardContent className="space-y-3 py-6 text-sm text-foreground/70">
              <p className="text-base font-semibold text-foreground">
                Your next nourishing week awaits.
              </p>
              <p>
                Select recipes for each day below and save your first plan.
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      <section id="planner">
        <MealPlanGrid
          days={days}
          recipes={recipes ?? []}
          initialMeals={initialMeals}
          weekStart={weekStart}
          action={saveMealPlan}
        />
      </section>
    </div>
  );
}

function MealPlanFallback() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="border-border/60 shadow-sm">
          <CardContent className="space-y-3 py-6">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function MealPlanPage({ searchParams }: MealPlanPageProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Weekly meal planner</h1>
        <p className="text-sm text-foreground/70">
          Assign recipes to each meal and keep your week beautifully balanced.
        </p>
      </header>
      <Suspense fallback={<MealPlanFallback />}>
        <MealPlanContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
