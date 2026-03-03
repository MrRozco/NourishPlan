"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const ingredientSchema = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  amount: z.number().positive().optional(),
  unit: z.string().min(1, "Unit is required"),
});

const recipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  ingredients: z.array(ingredientSchema).min(1, "Add at least one ingredient"),
  instructions: z.array(z.string()).optional(),
  prep_time: z.number().int().nonnegative().optional(),
  cook_time: z.number().int().nonnegative().optional(),
  servings: z.number().int().positive().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
});

export type RecipeActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

function parseNumber(value: FormDataEntryValue | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseIngredients(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((ingredient) => ({
        name: String(ingredient.name ?? "").trim(),
        amount:
          ingredient.amount === "" || ingredient.amount == null
            ? undefined
            : Number(ingredient.amount),
        unit: String(ingredient.unit ?? "").trim(),
      }))
      .filter((ingredient) => ingredient.name && ingredient.unit);
  } catch {
    return [];
  }
}

function parseInstructions(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function createRecipe(
  _prevState: RecipeActionState,
  formData: FormData,
): Promise<RecipeActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) {
    return {
      status: "error",
      message: "You must be signed in to create a recipe.",
    };
  }

  const parsed = recipeSchema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || undefined,
    ingredients: parseIngredients(formData.get("ingredients")),
    instructions: parseInstructions(formData.get("instructions")),
    prep_time: parseNumber(formData.get("prep_time")),
    cook_time: parseNumber(formData.get("cook_time")),
    servings: parseNumber(formData.get("servings")),
    image_url: String(formData.get("image_url") ?? "").trim(),
  });

  if (!parsed.success) {
    return { status: "error", message: "Please check your recipe details." };
  }

  const payload = parsed.data;

  const { error } = await supabase.from("recipes").insert({
    user_id: user.id,
    title: payload.title,
    description: payload.description ?? null,
    ingredients: payload.ingredients,
    instructions: payload.instructions ?? null,
    prep_time: payload.prep_time ?? null,
    cook_time: payload.cook_time ?? null,
    servings: payload.servings ?? null,
    image_url: payload.image_url || null,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/recipes");
  return { status: "success", message: "Recipe saved." };
}

export async function updateRecipe(
  recipeId: string,
  _prevState: RecipeActionState,
  formData: FormData,
): Promise<RecipeActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) {
    return {
      status: "error",
      message: "You must be signed in to update a recipe.",
    };
  }

  const parsed = recipeSchema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || undefined,
    ingredients: parseIngredients(formData.get("ingredients")),
    instructions: parseInstructions(formData.get("instructions")),
    prep_time: parseNumber(formData.get("prep_time")),
    cook_time: parseNumber(formData.get("cook_time")),
    servings: parseNumber(formData.get("servings")),
    image_url: String(formData.get("image_url") ?? "").trim(),
  });

  if (!parsed.success) {
    return { status: "error", message: "Please check your recipe details." };
  }

  const payload = parsed.data;

  const { error } = await supabase
    .from("recipes")
    .update({
      title: payload.title,
      description: payload.description ?? null,
      ingredients: payload.ingredients,
      instructions: payload.instructions ?? null,
      prep_time: payload.prep_time ?? null,
      cook_time: payload.cook_time ?? null,
      servings: payload.servings ?? null,
      image_url: payload.image_url || null,
    })
    .eq("id", recipeId)
    .eq("user_id", user.id);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/recipes");
  revalidatePath(`/recipes/${recipeId}`);
  return { status: "success", message: "Recipe updated." };
}

export async function deleteRecipe(recipeId: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) {
    throw new Error("You must be signed in to delete a recipe.");
  }

  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", recipeId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/recipes");
}
