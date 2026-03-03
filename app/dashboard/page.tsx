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

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function RecentRecipes() {
  const supabase = await createClient();
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, description, prep_time, cook_time, servings")
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    return (
      <Card className="border-border/60 bg-destructive/10">
        <CardContent className="py-6 text-sm text-destructive">
          We couldn&apos;t load recipes yet. Double-check your sample data or try
          again in a moment.
        </CardContent>
      </Card>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <Card className="border-border/60 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <CardContent className="space-y-3 py-8 text-sm text-foreground/70">
          <p className="text-base font-semibold text-foreground">
            Your next nourishing week awaits.
          </p>
          <p>
            Start by saving a recipe and we&apos;ll keep your ideas organized.
          </p>
          <Button asChild size="sm">
            <Link href="/recipes">Add a recipe</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {recipes.map((recipe) => (
        <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="block">
          <Card className="border-border/60 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg hover:underline">
                {recipe.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground/70">
              <p>{recipe.description ?? "No description yet."}</p>
              <div className="flex flex-wrap gap-2 text-xs text-foreground/60">
                <span>Prep: {recipe.prep_time ?? 0}m</span>
                <span>Cook: {recipe.cook_time ?? 0}m</span>
                <span>Serves: {recipe.servings ?? 1}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function RecentRecipesFallback() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="border-border/60 shadow-sm">
          <CardHeader>
            <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-3 w-12 animate-pulse rounded bg-muted" />
              <div className="h-3 w-12 animate-pulse rounded bg-muted" />
              <div className="h-3 w-12 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/15 via-white to-secondary/15 p-8 shadow-sm md:p-12">
        <div className="max-w-2xl space-y-4">
          <Badge className="w-fit bg-primary/15 text-primary hover:bg-primary/20">
            Welcome back
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Plan nourishing meals with ease
          </h1>
          <p className="text-base text-foreground/70">
            Organize your recipes, shape a balanced week, and keep your shopping
            list fresh. Everything you need to fuel mindful, delicious routines
            lives right here.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/recipes">Create your first recipe</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/meal-plan">Build this week&apos;s plan</Link>
            </Button>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Link href="/recipes" className="block">
          <Card className="border-border/60 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Recipe Library</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/70">
              Save go-to meals with ingredients, timings, and nutrient-friendly
              notes for effortless repeats.
            </CardContent>
          </Card>
        </Link>
        <Link href="/meal-plan" className="block">
          <Card className="border-border/60 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Weekly Rhythm</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/70">
              Draft breakfast, lunch, and dinner slots with clarity and adjust
              with calming drag-and-drop flows.
            </CardContent>
          </Card>
        </Link>
        <Link href="/shopping-list" className="block">
          <Card className="border-border/60 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Smart Shopping</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/70">
              Auto-generate a clean, categorized list that keeps every ingredient
              aligned with your plan.
            </CardContent>
          </Card>
        </Link>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent recipes</h2>
          <Button variant="outline" asChild>
            <Link href="/recipes">View all</Link>
          </Button>
        </div>
        <Suspense fallback={<RecentRecipesFallback />}>
          <RecentRecipes />
        </Suspense>
      </section>
    </div>
  );
}
