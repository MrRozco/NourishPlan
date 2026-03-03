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
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import { RecipeForm } from "@/components/recipes/recipe-form";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { IngredientsSuggestions } from "@/components/ai/ingredients-suggestions";
import { createRecipe } from "@/app/recipes/actions";
import { Card, CardContent } from "@/components/ui/card";

async function RecipeList() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <Card className="border-border/60 bg-destructive/10">
        <CardContent className="py-6 text-sm text-destructive">
          We couldn&apos;t load recipes yet. Try again shortly.
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-border/60">
        <CardContent className="py-6 text-sm text-foreground/70">
          No recipes yet. Add your first nourishing dish on the right.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}

function RecipeListFallback() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="border-border/60 shadow-sm">
          <CardContent className="space-y-3 py-6">
            <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface RecipesPageProps {
  searchParams: Promise<{
    draft?: string;
  }>;
}

async function RecipesContent({ searchParams }: RecipesPageProps) {
  const params = await searchParams;
  const draftPayload = params.draft
    ? JSON.parse(decodeURIComponent(params.draft))
    : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Your recipes</h1>
          <p className="text-sm text-foreground/70">
            Keep your favorite meals organized and ready to plan.
          </p>
        </div>
        <IngredientsSuggestions />
        <Suspense fallback={<RecipeListFallback />}>
          <RecipeList />
        </Suspense>
      </section>
      <aside className="space-y-4" id="recipe-form">
        <RecipeForm
          key={params.draft ?? "new"}
          action={createRecipe}
          title="Add a new recipe"
          description="Capture ingredients, steps, and timing in one place."
          draft={draftPayload}
        />
      </aside>
    </div>
  );
}

export default function RecipesPage({ searchParams }: RecipesPageProps) {
  return (
    <Suspense fallback={<RecipeListFallback />}>
      <RecipesContent searchParams={searchParams} />
    </Suspense>
  );
}
