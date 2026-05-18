import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

// Initialize the Google Generative AI client with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
    const body = await req.json();
    const { image, mimeType } = body as { image?: string; mimeType?: string };

    // 1. Validation: Ensure image is provided
    if (!image) {
      return Response.json(
        { error: "No image provided. Please upload an image first." },
        { status: 400 }
      );
    }

    // 2. Validation: Ensure API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "Gemini API key is not configured on the server." },
        { status: 500 }
      );
    }

    // 3. Resolve the image MIME type
    const resolvedMime = mimeType ?? detectMimeType(image);

    // 4. Initialize the correct verified Gemini model (gemini-2.5-flash-lite)
    // gemini-1.5-flash and gemini-1.5-flash-8b return 404 for this API key,
    // so we use gemini-2.5-flash-lite which is verified, active, and supported.
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    // 5. Build improved prompt exactly as requested to check monument and artwork validity first
    const prompt = `You are an expert heritage museum guide and art historian.

First determine whether the uploaded image is:
* a real monument
* heritage site
* historical structure
* sculpture
* statue
* famous painting
* monumental artwork
* ancient cultural artwork
* world-famous landmark

If the image is NOT related to monuments or famous artworks, respond ONLY with:
'This is not a monument or famous artwork image. Please upload a valid heritage site, monument, sculpture, or artwork image.'

If the image IS valid:
Return EXACTLY in the following structured format (do not use any markdown bolding inside the bracketed answers themselves):

Name: [Name of landmark or artwork]
Location or museum: [Location or Museum where it is located or housed]
Built or created by: [Builder, Ruler, Architect, Painter, or Artist name]
Purpose or artistic meaning: [Purpose of the structure, or the artistic / symbolic meaning of the masterpiece]
Era / year / century: [Year, Century, or Era created]

Story:
[Write an accurate, cinematic, emotional, and concise storytelling paragraph about the landmark or masterpiece. Describe its glory, history, significance, or emotional story. Do not repeat the individual fields listed above in this section.]`;

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

  } catch (error: any) {
    console.error("[Relic AI API Error]:", error);

    const message = error?.message || "An unexpected error occurred during image scanning.";

    // Return detailed error for UI handling
    return Response.json(
      { error: `Scan failed: ${message}` },
      { status: 500 }
    );
  }
}