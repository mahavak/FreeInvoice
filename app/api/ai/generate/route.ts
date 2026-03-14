import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

/**
 * AI Generation Bridge: FreeInvoice -> 3090 Ti (Local Qwen Server)
 * Author: Senior AI Engineering Collaborator
 * Purpose: Zero-cost AI inference for professional line-item generation.
 */
export async function POST(req: Request) {
  // SaaS Gating: Ensure only authenticated users can use the GPU resources
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt } = await req.json();

  try {
    // Local AI Server (llama-cpp-python on port 8080)
    const response = await fetch("http://localhost:8080/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen",
        messages: [
          { 
            role: "system", 
            content: "You are a professional freelance consultant. Convert the user's project description into a JSON array of invoice line items. Each item must have 'description', 'quantity' (hours), and 'price' (hourly rate). Example: [{\"description\": \"Initial UI Design\", \"quantity\": 10, \"price\": 75}]. Return ONLY the JSON array." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.1, // Low temperature for consistent JSON output
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) throw new Error("AI Server Unreachable");

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the AI's JSON output
    const items = JSON.parse(content);
    return NextResponse.json({ items });

  } catch (error: any) {
    console.error("[AI_BRIDGE_ERROR]:", error.message);
    return NextResponse.json(
      { error: "Local AI Node Offline. Ensure start-llm-server.sh is running." }, 
      { status: 503 }
    );
  }
}
