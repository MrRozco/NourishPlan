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
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import type { AiActionState } from "@/app/ai/actions";
import { findRecipesFromIngredients } from "@/app/ai/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Suggestion {
  title: string;
  description: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  ingredients: Array<{ name: string; amount?: number; unit?: string }>;
  instructions: string[];
  isUserRecipe: boolean;
}

export function IngredientsSuggestions() {
  const router = useRouter();
  const [ingredientInput, setIngredientInput] = React.useState("");
  const [state, formAction] = React.useActionState<
    AiActionState<Suggestion[]>,
    FormData
  >(findRecipesFromIngredients, { status: "idle" });

  React.useEffect(() => {
    if (state.status === "error") {
      toast.error(state.message ?? "Unable to get suggestions.");
    }
  }, [state]);

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">What&apos;s in your fridge?</CardTitle>
        <p className="text-sm text-foreground/70">
          List ingredients and get recipe ideas tailored to you.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={formAction} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="ingredients">Ingredients</Label>
            <Input
              id="ingredients"
              name="ingredients"
              placeholder="e.g. chickpeas, spinach, lemon"
              value={ingredientInput}
              onChange={(event) => setIngredientInput(event.target.value)}
              required
            />
          </div>
          <SubmitButton />
        </form>

        <SuggestionsLoading />

        {state.status === "success" && state.data?.length ? (
          <div className="space-y-3">
            {state.data.map((suggestion, index) => (
              <Card key={`${suggestion.title}-${index}`} className="border-border/60">
                <CardContent className="space-y-1 py-4 text-sm">
                  <p className="font-semibold text-foreground">
                    {suggestion.title}
                  </p>
                  <p className="text-foreground/70">{suggestion.description}</p>
                  <p className="text-xs text-primary">
                    {suggestion.isUserRecipe
                      ? "From your library"
                      : "New idea"}
                  </p>
                  <p className="text-xs text-foreground/60">
                    Prep {suggestion.prep_time}m · Cook {suggestion.cook_time}m ·
                    Serves {suggestion.servings}
                  </p>
                  <div className="text-xs text-foreground/60">
                    <p className="font-medium text-foreground/70">
                      Ingredients
                    </p>
                    <ul className="list-disc pl-4">
                      {suggestion.ingredients.map((ingredient, idx) => (
                        <li key={`${ingredient.name}-${idx}`}>
                          {ingredient.amount ? `${ingredient.amount} ` : ""}
                          {ingredient.unit ? `${ingredient.unit} ` : ""}
                          {ingredient.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const draftPayload = encodeURIComponent(
                        JSON.stringify({
                          title: suggestion.title,
                          description: suggestion.description,
                          prep_time: suggestion.prep_time,
                          cook_time: suggestion.cook_time,
                          servings: suggestion.servings,
                          ingredients: suggestion.ingredients,
                          instructions: suggestion.instructions,
                          sourceIngredients: ingredientInput,
                        }),
                      );
                      const params = new URLSearchParams({
                        draft: draftPayload,
                      });
                      router.push(`/recipes?${params.toString()}#recipe-form`);
                    }}
                  >
                    Use this idea
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Finding ideas..." : "Suggest recipes"}
    </Button>
  );
}

function SuggestionsLoading() {
  const { pending } = useFormStatus();
  if (!pending) return null;

  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="border-border/60">
          <CardContent className="space-y-2 py-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
