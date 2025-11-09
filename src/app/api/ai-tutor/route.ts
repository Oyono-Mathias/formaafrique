// src/app/api/ai-tutor/route.ts
import { aiTutorChatbot } from "@/ai/ai-tutor-chatbot";
import {NextRequest, NextResponse} from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { question, formationId } = await req.json();
    
    if (!question) {
        return NextResponse.json({ error: 'La question est requise.' }, { status: 400 });
    }

    const result = await aiTutorChatbot({ question, formationId });
    
    return NextResponse.json(result);

  } catch (error) {
    console.error("Error in AI Tutor API route:", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
