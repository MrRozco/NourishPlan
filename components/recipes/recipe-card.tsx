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

import type { Recipe } from "@/types/recipe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card className="group overflow-hidden border-border/60 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          <Link href={`/recipes/${recipe.id}`} className="hover:underline">
            {recipe.title}
          </Link>
        </CardTitle>
        <p className="text-sm text-foreground/70">
          {recipe.description ?? "A nourishing recipe ready to be saved."}
        </p>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 text-xs text-foreground/60">
        <span>Prep {recipe.prep_time ?? 0}m</span>
        <span>Cook {recipe.cook_time ?? 0}m</span>
        <span>Serves {recipe.servings ?? 1}</span>
      </CardContent>
    </Card>
  );
}
