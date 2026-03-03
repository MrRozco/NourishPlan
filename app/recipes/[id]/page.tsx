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
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { deleteRecipe, updateRecipe } from "@/app/recipes/actions";
import { RecipeAiPanel } from "@/components/ai/recipe-ai-panel";
import { RecipeForm } from "@/components/recipes/recipe-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecipeDetailPageProps {
  params: Promise<{ id: string }>;
}

interface RecipeDetailProps {
  params: Promise<{ id: string }>;
}

async function RecipeDetail({ params }: RecipeDetailProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !recipe) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="h-72 w-full object-cover"
          />
        ) : (
          <div className="flex h-72 items-center justify-center bg-gradient-to-br from-primary/10 via-white to-secondary/15 text-sm text-foreground/60">
            Add a photo to bring this recipe to life.
          </div>
        )}
        <div className="space-y-4 px-6 py-6 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-foreground/60">Recipe</p>
              <h1 className="text-3xl font-semibold">{recipe.title}</h1>
            </div>
            <Button variant="outline" asChild>
              <Link href="/recipes">Back to recipes</Link>
            </Button>
          </div>
          <p className="text-foreground/70">
            {recipe.description ?? "A nourishing recipe ready to be enjoyed."}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-foreground/70">
            <span>Prep: {recipe.prep_time ?? 0}m</span>
            <span>Cook: {recipe.cook_time ?? 0}m</span>
            <span>Serves: {recipe.servings ?? 1}</span>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Ingredients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-foreground/70">
              {recipe.ingredients?.length ? (
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient: any, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      <span>
                        {ingredient.amount ? `${ingredient.amount} ` : ""}
                        {ingredient.unit} {ingredient.name}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No ingredients listed yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-foreground/70">
              {recipe.instructions?.length ? (
                <ol className="list-decimal space-y-2 pl-4">
                  {recipe.instructions.map((step: string, index: number) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              ) : (
                <p>No instructions added yet.</p>
              )}
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-6">
          <RecipeAiPanel recipeId={recipe.id} />
          <RecipeForm
            action={updateRecipe.bind(null, recipe.id)}
            title="Edit recipe"
            description="Adjust ingredients or timings whenever you need."
            initialData={recipe}
          />
          <Card className="border-border/60 bg-destructive/5">
            <CardContent className="space-y-4 py-6">
              <h3 className="text-sm font-semibold text-destructive">
                Remove this recipe
              </h3>
              <p className="text-sm text-foreground/70">
                Deleting is permanent. This will remove it from plans and lists.
              </p>
              <form action={deleteRecipe.bind(null, recipe.id)}>
                <Button variant="destructive" type="submit">
                  Delete recipe
                </Button>
              </form>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function RecipeDetailFallback() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
        <div className="h-72 w-full animate-pulse bg-muted" />
        <div className="space-y-4 px-6 py-6 md:px-8">
          <div className="h-6 w-40 animate-pulse rounded bg-muted" />
          <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
        </div>
      </section>
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="space-y-3 py-6">
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-sm">
            <CardContent className="space-y-3 py-6">
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        </div>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="space-y-3 py-6">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  return (
    <Suspense fallback={<RecipeDetailFallback />}>
      <RecipeDetail params={params} />
    </Suspense>
  );
}
