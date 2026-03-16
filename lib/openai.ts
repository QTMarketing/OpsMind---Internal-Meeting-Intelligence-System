import OpenAI from "openai";

/**
 * Singleton OpenAI client initialized from OPENAI_API_KEY in .env
 *
 * Usage:
 *   import openai from "@/lib/openai";
 *   const response = await openai.chat.completions.create({ ... });
 */

if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "sk-...") {
  throw new Error(
    "[OpsMind] Missing OPENAI_API_KEY. Add your key to .env before using the OpenAI client."
  );
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;
