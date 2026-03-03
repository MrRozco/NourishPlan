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
import { toast } from "sonner";

import type { AiActionState } from "@/app/ai/actions";
import { getRecipeNutrition, suggestSubstitutions } from "@/app/ai/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RecipeAiPanelProps {
  recipeId: string;
}

interface NutritionResult {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  summary: string;
}

export function RecipeAiPanel({ recipeId }: RecipeAiPanelProps) {
  const [nutritionState, nutritionAction] = React.useActionState<
    AiActionState<NutritionResult>,
    FormData
  >(
    async (prevState, _formData) =>
      getRecipeNutrition(recipeId, prevState),
    { status: "idle" },
  );

  const [substitutionState, substitutionAction] = React.useActionState<
    AiActionState<string[]>,
    FormData
  >(suggestSubstitutions, { status: "idle" });

  React.useEffect(() => {
    if (nutritionState.status === "error") {
      toast.error(nutritionState.message ?? "Unable to get nutrition.");
    }
  }, [nutritionState]);

  React.useEffect(() => {
    if (substitutionState.status === "error") {
      toast.error(substitutionState.message ?? "Unable to get substitutions.");
    }
  }, [substitutionState]);

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Nutrition snapshot</CardTitle>
          <p className="text-sm text-foreground/70">
            Tap to estimate calories and macros.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <form action={nutritionAction}>
            <Button type="submit">Generate nutrition</Button>
          </form>
          {nutritionState.status === "success" && nutritionState.data ? (
            <div className="space-y-2 text-sm text-foreground/70">
              <p>{nutritionState.data.summary}</p>
              <div className="flex flex-wrap gap-3 text-xs text-foreground/60">
                <span>{nutritionState.data.calories} kcal</span>
                <span>{nutritionState.data.protein_g}g protein</span>
                <span>{nutritionState.data.carbs_g}g carbs</span>
                <span>{nutritionState.data.fat_g}g fat</span>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Ingredient swaps</CardTitle>
          <p className="text-sm text-foreground/70">
            Find substitutions for dietary goals.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={substitutionAction} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="ingredient">Ingredient</Label>
              <Input id="ingredient" name="ingredient" placeholder="e.g. butter" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dietary_goal">Dietary goal</Label>
              <Input id="dietary_goal" name="dietary_goal" placeholder="e.g. dairy-free" required />
            </div>
            <Button type="submit" variant="outline">Suggest swaps</Button>
          </form>
          {substitutionState.status === "success" && substitutionState.data ? (
            <ul className="list-disc space-y-1 pl-4 text-sm text-foreground/70">
              {substitutionState.data.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
