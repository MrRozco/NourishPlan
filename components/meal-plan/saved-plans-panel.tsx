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
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SavedPlanSummary {
  id: string;
  week_start: string;
  filledSlots: number;
  totalSlots: number;
}

interface SavedPlansPanelProps {
  savedPlans: SavedPlanSummary[];
  currentWeekStart: string;
}

export function SavedPlansPanel({ savedPlans, currentWeekStart }: SavedPlansPanelProps) {
  const router = useRouter();

  const handleSelect = (week: string) => {
    router.push(`/meal-plan?week=${week}`);
    router.refresh();
  };

  const handleCreate = () => {
    router.push(`/meal-plan?week=${currentWeekStart}&create=1`);
    router.refresh();
  };

  return (
    <section className="space-y-3" id="saved-plans">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Saved meal plans</h2>
          <p className="text-sm text-foreground/70">
            Jump back to any week and keep planning with ease.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCreate}>
            Create plan
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              document
                .getElementById("planner")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Go to planner
          </Button>
        </div>
      </div>

      {savedPlans.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {savedPlans.map((plan) => (
            <Card
              key={plan.id}
              className="cursor-pointer border-border/60 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              onClick={() => handleSelect(plan.week_start)}
            >
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-semibold">Week of</p>
                  <p className="text-sm text-foreground/70">
                    {format(parseISO(plan.week_start), "MMM d, yyyy")}
                  </p>
                  <p className="text-xs text-foreground/60">
                    {plan.filledSlots} of {plan.totalSlots} meals planned
                  </p>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="text-primary"
                  onClick={(event) => {
                    event.stopPropagation();
                    router.push(`/shopping-list?week=${plan.week_start}`);
                  }}
                >
                  Shopping list
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border/60 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <CardContent className="space-y-3 py-6 text-sm text-foreground/70">
            <p className="text-base font-semibold text-foreground">
              Your next nourishing week awaits.
            </p>
            <p>Select recipes below and save your first plan.</p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
