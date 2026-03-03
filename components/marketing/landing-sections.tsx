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

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
};

export function LandingSections() {
  return (
    <div className="space-y-20">
      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Curated recipes",
            body: "Capture ingredients, steps, and timings so every nourishing favorite is ready for repeat.",
          },
          {
            title: "Weekly flow",
            body: "Plan breakfast, lunch, and dinner with a calming grid that keeps your week aligned.",
          },
          {
            title: "Smart shopping",
            body: "Generate a clean list that makes grocery runs efficient and intentional.",
          },
        ].map((card) => (
          <motion.div key={card.title} {...fadeUp}>
            <Card className="border-border/60 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground/70">
                {card.body}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <motion.div {...fadeUp}>
          <Card className="border-border/60 bg-gradient-to-br from-primary/10 via-background to-secondary/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Why NourishPlan works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-foreground/70">
              <p>
                Create a recipe once, reuse it across the week, and let the app
                keep your grocery list synced. The AI coach adds ideas and keeps
                you nourished with smart substitutions.
              </p>
              <ul className="list-disc space-y-2 pl-4">
                <li>Personal recipe library with delightful visuals.</li>
                <li>Weekly planner that stays calm and organized.</li>
                <li>Shopping lists that update as your plan evolves.</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div {...fadeUp}>
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Loved by mindful eaters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-foreground/70">
              <p>“Finally a planner that feels soothing and premium.”</p>
              <p>“The AI suggestions make weeknights effortless.”</p>
              <p>“My shopping list is always organized.”</p>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <motion.section {...fadeUp}>
        <Card className="border-border/60 bg-card px-8 py-10 shadow-lg md:px-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Ready to plan with ease?</h2>
              <p className="text-sm text-foreground/70">
                Build your first week and let NourishPlan handle the rest.
              </p>
            </div>
            <Button asChild>
              <Link href="/meal-plan">Start meal planning</Link>
            </Button>
          </div>
        </Card>
      </motion.section>
    </div>
  );
}
