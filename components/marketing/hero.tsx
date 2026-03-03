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

import Link from "next/link";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function MarketingHero() {
  return (
    <section className="relative overflow-hidden rounded-[36px] border border-border/60 bg-gradient-to-br from-primary/20 via-white to-secondary/25 p-10 shadow-2xl dark:from-primary/25 dark:via-background dark:to-secondary/20 md:p-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-2xl space-y-6"
      >
        <Badge className="w-fit bg-primary/20 text-primary hover:bg-primary/30">
          NourishPlan
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
          A premium wellness hub for recipes, meal plans, and mindful eating.
        </h1>
        <p className="text-base text-foreground/80">
          Turn your pantry into personalized menus. NourishPlan keeps recipes,
          weekly plans, and shopping lists in one vibrant, AI-assisted space so
          your healthy rhythm feels effortless.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/auth/login">Start your free plan</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Preview the workspace</Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-foreground/75">
          <div>
            <p className="text-2xl font-semibold text-foreground">7×3</p>
            <p>Weekly meal slots</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">AI</p>
            <p>Recipe inspiration</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">1 tap</p>
            <p>Shopping list export</p>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/25 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-secondary/25 blur-3xl"
      />
    </section>
  );
}
