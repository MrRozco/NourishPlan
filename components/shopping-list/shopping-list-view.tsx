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

import type { ShoppingListGroup } from "@/app/shopping-list/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ShoppingListViewProps {
  groups: ShoppingListGroup[];
}

export function ShoppingListView({ groups }: ShoppingListViewProps) {
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});

  const handleToggle = (name: string) => {
    setChecked((current) => ({ ...current, [name]: !current[name] }));
  };

  const handleCopy = async () => {
    const lines = groups
      .flatMap((group) => group.items)
      .map((item) => `${item.name}${item.amount ? ` (${item.amount}${item.unit ? ` ${item.unit}` : ""})` : ""}`);

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Shopping list copied.");
    } catch {
      toast.error("Unable to copy list.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Your shopping list</h2>
          <p className="text-sm text-foreground/70">
            Check items off and keep everything organized.
          </p>
        </div>
        <Button variant="outline" onClick={handleCopy}>
          Copy list
        </Button>
      </div>

      {groups.map((group) => (
        <Card key={group.category} className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{group.category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {group.items.map((item) => {
              const id = item.name.toLowerCase();
              const label = `${item.name}${item.amount ? ` (${item.amount}${item.unit ? ` ${item.unit}` : ""})` : ""}`;
              return (
                <label
                  key={id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm transition hover:bg-primary/5"
                >
                  <input
                    type="checkbox"
                    checked={checked[id] ?? false}
                    onChange={() => handleToggle(id)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className={checked[id] ? "line-through text-foreground/50" : ""}>
                    {label}
                  </span>
                </label>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
