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
import { Plus, Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import type { Recipe, RecipeIngredient } from "@/types/recipe";
import type { RecipeActionState } from "@/app/recipes/actions";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RecipeFormProps {
  action: (
    prevState: RecipeActionState,
    formData: FormData,
  ) => Promise<RecipeActionState>;
  initialData?: Recipe | null;
  title: string;
  description?: string;
  draft?: {
    title?: string;
    description?: string;
    prep_time?: number;
    cook_time?: number;
    servings?: number;
    ingredients?: Array<{ name: string; amount?: number; unit?: string }>;
    instructions?: string[];
  } | null;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

export function RecipeForm({
  action,
  initialData,
  title,
  description,
  draft,
}: RecipeFormProps) {
  const initialIngredients = React.useMemo<RecipeIngredient[]>(() => {
    if (initialData?.ingredients?.length) {
      return initialData.ingredients;
    }
    if (draft?.ingredients && draft.ingredients.length > 0) {
      return draft.ingredients.map((ingredient) => ({
        name: ingredient.name,
        amount: ingredient.amount ?? 1,
        unit: ingredient.unit ?? "",
      }));
    }
    return [
      {
        name: "",
        amount: 1,
        unit: "",
      },
    ];
  }, [draft?.ingredients, initialData?.ingredients]);

  const [state, formAction] = React.useActionState<RecipeActionState, FormData>(
    action,
    { status: "idle" },
  );
  const [ingredients, setIngredients] = React.useState<RecipeIngredient[]>(
    initialIngredients
  );
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(
    initialData?.image_url ?? null
  );
  const [imageUrl, setImageUrl] = React.useState<string>(
    initialData?.image_url ?? ""
  );
  const [isUploading, setIsUploading] = React.useState(false);

  React.useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Recipe saved.");
    }
    if (state.status === "error") {
      toast.error(state.message ?? "Unable to save recipe.");
    }
  }, [state]);

  React.useEffect(() => {
    if (!initialData && draft?.ingredients?.length) {
      setIngredients(initialIngredients);
    }
  }, [draft?.ingredients, initialData, initialIngredients]);

  const instructionsValue = React.useMemo(() => {
    if (initialData?.instructions?.length) {
      return initialData.instructions.join("\n");
    }
    if (draft?.instructions?.length) {
      return draft.instructions.join("\n");
    }
    return "";
  }, [draft?.instructions, initialData?.instructions]);

  const handleIngredientChange = (
    index: number,
    field: keyof RecipeIngredient,
    value: string
  ) => {
    setIngredients((current) =>
      current.map((ingredient, idx) =>
        idx === index
          ? {
              ...ingredient,
              [field]:
                field === "amount"
                  ? value === ""
                    ? undefined
                    : Number(value)
                  : value,
            }
          : ingredient
      )
    );
  };

  const addIngredient = () => {
    setIngredients((current) => [
      ...current,
      { name: "", amount: 1, unit: "" },
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredients((current) => current.filter((_, idx) => idx !== index));
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const supabase = createBrowserClient();
      const fileExt = file.name.split(".").pop() ?? "jpg";
      const safeName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-_.]/g, "");
      const filePath = `recipes/${crypto.randomUUID?.() ?? Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("recipe-images")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("recipe-images")
        .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        throw new Error("Unable to get image URL.");
      }

      setImageUrl(data.publicUrl);
      setPreviewUrl(data.publicUrl);
      toast.success("Image uploaded and linked to this recipe.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Image upload failed.";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description ? (
          <p className="text-sm text-foreground/70">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={initialData?.title ?? draft?.title ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                name="image_url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              defaultValue={
                initialData?.description ?? draft?.description ?? ""
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="prep_time">Prep time (minutes)</Label>
              <Input
                id="prep_time"
                name="prep_time"
                type="number"
                min={0}
                defaultValue={
                  initialData?.prep_time ??
                  (typeof draft?.prep_time === "number" ? draft.prep_time : "")
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cook_time">Cook time (minutes)</Label>
              <Input
                id="cook_time"
                name="cook_time"
                type="number"
                min={0}
                defaultValue={
                  initialData?.cook_time ??
                  (typeof draft?.cook_time === "number" ? draft.cook_time : "")
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                name="servings"
                type="number"
                min={1}
                defaultValue={
                  initialData?.servings ??
                  (typeof draft?.servings === "number" ? draft.servings : "")
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Ingredients</Label>
              <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                <Plus className="mr-1 h-4 w-4" /> Add ingredient
              </Button>
            </div>
            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="grid gap-3 rounded-xl border border-border/60 p-3 md:grid-cols-12">
                  <div className="md:col-span-6">
                    <Input
                      placeholder="Ingredient name"
                      value={ingredient.name}
                      onChange={(event) =>
                        handleIngredientChange(index, "name", event.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Input
                      placeholder="Amount"
                      type="number"
                      min={0}
                      value={ingredient.amount ?? ""}
                      onChange={(event) =>
                        handleIngredientChange(index, "amount", event.target.value)
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Unit"
                      value={ingredient.unit}
                      onChange={(event) =>
                        handleIngredientChange(index, "unit", event.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="md:col-span-1 flex items-center justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                      disabled={ingredients.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <input type="hidden" name="ingredients" value={JSON.stringify(ingredients)} />

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions (one per line)</Label>
            <textarea
              id="instructions"
              name="instructions"
              defaultValue={instructionsValue}
              className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_file">Optional photo upload</Label>
            <Input
              id="image_file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {isUploading ? (
              <p className="text-xs text-foreground/60">
                Uploading image…
              </p>
            ) : null}
            {previewUrl ? (
              <div className="overflow-hidden rounded-xl border border-border/60">
                <img src={previewUrl} alt="Recipe preview" className="h-48 w-full object-cover" />
              </div>
            ) : null}
          </div>

          <SubmitButton label="Save recipe" />
        </form>
      </CardContent>
    </Card>
  );
}
