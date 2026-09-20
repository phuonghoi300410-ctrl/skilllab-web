"use client";

import { createClient } from "@supabase/supabase-js";

export type SkillRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  price_vnd: number;
  status: "draft" | "published";
  description: string;
  delivery: string;
  resource_url: string | null;
  cover_url: string | null;
  accent: "yellow" | "pink" | "silver";
  featured: boolean;
};

export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;
  return createClient(url, key);
}
