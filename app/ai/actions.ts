"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const ingredientsInputSchema = z.object({
  ingredients: z.array(z.string().min(1)).min(1),
});

const substitutionSchema = z.object({
  ingredient: z.string().min(1),
  dietaryGoal: z.string().min(1),
});

export type AiActionState<T> = {
  status: "idle" | "success" | "error";
  message?: string;
  data?: T;
};

interface GrokSuggestion {
  title: string;
  description: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  ingredients: Array<{ name: string; amount?: number; unit?: string }>;
  instructions: string[];
  isUserRecipe: boolean;
}

interface GrokNutrition {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  summary: string;
}

async function callGrok(systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("XAI_API_KEY is not configured.");
  }

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-3-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Grok request failed (${response.status}). ${errorText || ""}`.trim(),
    );
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Grok returned no content.");
  }

  return content;
}

export async function findRecipesFromIngredients(
  _prev: AiActionState<GrokSuggestion[]>,
  formData: FormData,
): Promise<AiActionState<GrokSuggestion[]>> {
  try {
    const input = String(formData.get("ingredients") ?? "");
    const ingredients = input
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const parsed = ingredientsInputSchema.safeParse({ ingredients });
    if (!parsed.success) {
      return { status: "error", message: "Add at least one ingredient." };
    }

    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) {
      return { status: "error", message: "Sign in to use AI suggestions." };
    }

    const { data: recipes } = await supabase
      .from("recipes")
      .select("id, title, ingredients")
      .eq("user_id", user.id);

    const recipeSummary = (recipes ?? []).map((recipe: any) => ({
      title: recipe.title,
      ingredients: recipe.ingredients?.map((i: any) => i.name).filter(Boolean),
    }));

    const content = await callGrok(
      "You are a helpful nutrition assistant. Return ONLY valid JSON.",
      `Ingredients on hand: ${ingredients.join(", ")}.\nUser recipes: ${JSON.stringify(
        recipeSummary,
      )}.\nSuggest 3-5 recipes. Prefer existing user recipes when possible and label them.\nReturn JSON array of objects with full recipe drafts: [{"title":"...","description":"...","prep_time":number,"cook_time":number,"servings":number,"ingredients":[{"name":"...","amount":number,"unit":"..."}],"instructions":["..."] ,"isUserRecipe":true|false}].`,
    );

    const suggestions = JSON.parse(content) as GrokSuggestion[];
    return { status: "success", data: suggestions };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "AI request failed.",
    };
  }
}

export async function getRecipeNutrition(
  recipeId: string,
  _prev: AiActionState<GrokNutrition>,
): Promise<AiActionState<GrokNutrition>> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) {
      return { status: "error", message: "Sign in to use AI nutrition." };
    }

    const { data: recipe, error } = await supabase
      .from("recipes")
      .select("title, ingredients, servings")
      .eq("id", recipeId)
      .single();

    if (error || !recipe) {
      return { status: "error", message: "Recipe not found." };
    }

    const content = await callGrok(
      "You are a nutrition analyst. Return ONLY valid JSON.",
      `Estimate nutrition for this recipe: ${recipe.title}.\nIngredients: ${JSON.stringify(
        recipe.ingredients,
      )}. Servings: ${recipe.servings ?? 1}.\nReturn JSON: {"calories":number,"protein_g":number,"carbs_g":number,"fat_g":number,"summary":"..."}.`,
    );

    const nutrition = JSON.parse(content) as GrokNutrition;
    return { status: "success", data: nutrition };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "AI request failed.",
    };
  }
}

export async function suggestSubstitutions(
  _prev: AiActionState<string[]>,
  formData: FormData,
): Promise<AiActionState<string[]>> {
  try {
    const ingredient = String(formData.get("ingredient") ?? "").trim();
    const dietaryGoal = String(formData.get("dietary_goal") ?? "").trim();

    const parsed = substitutionSchema.safeParse({ ingredient, dietaryGoal });
    if (!parsed.success) {
      return { status: "error", message: "Add ingredient and goal." };
    }

    const content = await callGrok(
      "You are a helpful cooking assistant. Return ONLY valid JSON.",
      `Suggest 3-5 substitutions for ${ingredient} with goal: ${dietaryGoal}. Return JSON array of strings.`,
    );

    const suggestions = JSON.parse(content) as string[];
    return { status: "success", data: suggestions };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "AI request failed.",
    };
  }
}
