import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

// Helper function to detect MIME type from base64 string
function detectMimeType(base64: string): string {
  const prefix = base64.substring(0, 16);
  if (prefix.startsWith("/9j/"))            return "image/jpeg";
  if (prefix.startsWith("iVBORw"))          return "image/png";
  if (prefix.startsWith("R0lGOD"))          return "image/gif";
  if (prefix.startsWith("UklGR"))           return "image/webp";
  return "image/jpeg"; // default fallback
}

// POST endpoint for scanning the image
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Validation: Ensure API key is configured
    if (!apiKey) {
      console.error("[Relic AI Error] CRITICAL: GEMINI_API_KEY environment variable is missing.");
      return Response.json(
        { error: "Gemini API key is not configured on the server. Please check Vercel environment variables." },
        { status: 500 }
      );
    }

    // Initialize the Google Generative AI client safely inside the handler
    const genAI = new GoogleGenerativeAI(apiKey);

    const body = await req.json();
    const { image, mimeType } = body as { image?: string; mimeType?: string };

    // 1. Validation: Ensure image is provided
    if (!image) {
      return Response.json(
        { error: "No image provided. Please upload an image first." },
        { status: 400 }
      );
    }

    // 3. Resolve the image MIME type
    const resolvedMime = mimeType ?? detectMimeType(image);

    // 4. Initialize the correct verified Gemini model (gemini-2.5-flash-lite)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    // 5. Enhanced prompt with additional structured fields for richer heritage analysis
    const prompt = `You are an expert heritage museum guide, art historian, and cultural storyteller.

First determine whether the uploaded image is:
* a real monument
* heritage site
* historical structure
* sculpture or statue
* famous painting or artwork
* monumental artwork
* ancient cultural artifact
* world-famous landmark

If the image is NOT related to monuments or famous artworks, respond ONLY with:
'This is not a monument or famous artwork image. Please upload a valid heritage site, monument, sculpture, or artwork image.'

If the image IS valid:
Return EXACTLY in the following structured format (do not use any markdown bolding inside the bracketed answers):

Name: [Name of landmark or artwork]
Location or museum: [City, Country — or Museum name where it is housed]
Built or created by: [Builder, Ruler, Architect, Painter, or Artist name]
Purpose or artistic meaning: [Purpose of the structure, or the artistic / symbolic meaning]
Era / year / century: [Year, Century, or Era created]
Architecture style: [Architectural or art style — e.g. Gothic, Mughal, Renaissance, Baroque, Art Deco, etc.]
Civilization or culture: [The civilization or cultural tradition it belongs to — e.g. Ancient Egyptian, Mughal Empire, Roman, etc.]

Interesting facts:
[Write 2-3 fascinating and lesser-known facts about this landmark or artwork, separated by periods.]

Tourism tips:
[Write 2-3 helpful tips for visitors — best time to visit, nearby attractions, ticket info, etc.]

Story:
[Write an accurate, cinematic, emotional, and concise storytelling paragraph about the landmark or masterpiece. Describe its glory, history, significance, or emotional story. Make the reader feel like they are standing in front of it. Do not repeat the individual fields listed above in this section.]`;

    // 6. Generate the content using Gemini Vision
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: image,
          mimeType: resolvedMime,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Empty response received from Gemini.");
    }

    // 7. Detect invalid images and return a clean error response
    if (
      text.includes("This is not a monument or famous artwork image") || 
      text.toLowerCase().includes("please upload a valid heritage site") ||
      text.toLowerCase().includes("not a monument or famous artwork")
    ) {
      return Response.json(
        { error: "This is not a monument or famous artwork image. Please upload a valid heritage site, monument, sculpture, or artwork image." },
        { status: 400 }
      );
    }

    return Response.json({ text });

  } catch (error: unknown) {
    console.error("[Relic AI API Error]:", error);

    const message = error instanceof Error ? error.message : "An unexpected error occurred during image scanning.";

    // Return detailed error for UI handling
    return Response.json(
      { error: `Scan failed: ${message}` },
      { status: 500 }
    );
  }
}