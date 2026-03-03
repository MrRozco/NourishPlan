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
import { format } from "date-fns";

import { createClient } from "@/lib/supabase/server";
import { generateShoppingList } from "@/app/shopping-list/actions";
import { ShoppingListView } from "@/components/shopping-list/shopping-list-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ShoppingListPageProps {
  searchParams: Promise<{ week?: string }>;
}

async function ShoppingListContent({ searchParams }: ShoppingListPageProps) {
  const { week } = await searchParams;
  const supabase = await createClient();

  const { data: mealPlans } = await supabase
    .from("meal_plans")
    .select("week_start")
    .order("week_start", { ascending: false });

  const activeWeek = week ?? mealPlans?.[0]?.week_start;

  if (!activeWeek) {
    return (
      <Card className="border-border/60 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <CardContent className="space-y-3 py-8 text-sm text-foreground/70">
          <p className="text-base font-semibold text-foreground">
            Your pantry checklist starts here.
          </p>
          <p>Save a meal plan to generate your first shopping list.</p>
          <Button asChild size="sm">
            <Link href="/meal-plan">Build a meal plan</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const list = await generateShoppingList(activeWeek);

  if (!list.length) {
    return (
      <Card className="border-border/60 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <CardContent className="space-y-3 py-8 text-sm text-foreground/70">
          <p className="text-base font-semibold text-foreground">
            No ingredients yet.
          </p>
          <p>Pick recipes for the week to see them here.</p>
          <Button asChild size="sm">
            <Link href="/meal-plan">Choose recipes</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="text-sm font-semibold">Week of</p>
            <p className="text-sm text-foreground/70">
              {format(new Date(activeWeek), "MMM d, yyyy")}
            </p>
          </div>
        </CardContent>
      </Card>
      <ShoppingListView groups={list} />
    </div>
  );
}

function ShoppingListFallback() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, index) => (
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

export default function ShoppingListPage({ searchParams }: ShoppingListPageProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Shopping list</h1>
        <p className="text-sm text-foreground/70">
          Automatically aggregated ingredients for the week.
        </p>
      </header>
      <Suspense fallback={<ShoppingListFallback />}>
        <ShoppingListContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
