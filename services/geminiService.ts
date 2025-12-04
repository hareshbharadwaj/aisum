import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from '../types';

// ====================================================================================
// IMPORTANT: FOR LOCAL EXECUTION
// ====================================================================================
// This service reads the Google Gemini API key from the environment for local
// development. When using Vite, set the key in a local env file as:
//
//   VITE_GOOGLE_API_KEY=your_api_key_here
//
// Vite exposes variables that start with VITE_ via import.meta.env in the client.
// For server-side or alternative environments, the code will also check
// process.env.GOOGLE_API_KEY if available.
//
// NOTE: For production applications, prefer a secure server-side proxy or
// server environment variables (never embed secret API keys in client bundles
// for public deployment).
// ====================================================================================
const API_KEY = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_GOOGLE_API_KEY)
    || (typeof process !== 'undefined' && process.env && process.env.GOOGLE_API_KEY)
    || '';

if (!API_KEY) {
    console.warn("Gemini API key is not set. Please set VITE_GOOGLE_API_KEY in .env.local (for Vite) or GOOGLE_API_KEY in your environment.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });


export const generateSummary = async (text: string): Promise<string> => {
    try {
        const prompt = `Please provide a comprehensive yet concise summary of the following text. The summary should capture the key points, main arguments, and any important conclusions. Format the summary using markdown-like syntax for readability. Use '##' for main headings, '###' for subheadings, and '*' for bullet points. Ensure proper structure with paragraphs. Text to summarize:\n\n---\n\n${text}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.3,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error generating summary:", error);
        throw new Error("Failed to generate summary due to an API error. Check if your API key is valid.");
    }
};

const quizQuestionSchema = {
    type: Type.OBJECT,
    properties: {
        question: { type: Type.STRING, description: 'The quiz question.' },
        options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'An array of 4 possible answers.'
        },
        correctAnswer: { type: Type.STRING, description: 'The correct answer from the options.' },
        explanation: { type: Type.STRING, description: 'A brief explanation of why the answer is correct.' }
    },
    required: ['question', 'options', 'correctAnswer', 'explanation']
};


export const generateQuiz = async (summaryContent: string, originalContent: string): Promise<QuizQuestion[]> => {
    try {
        const prompt = `Based on the following summary and original text, generate a 5-question multiple-choice quiz to test understanding. For each question, provide 4 options, one correct answer, and a brief explanation for the correct answer.

        Summary:
        ---
        ${summaryContent}
        ---

        Original Content (for context):
        ---
        ${originalContent}
        ---`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: quizQuestionSchema,
                }
            }
        });

        const jsonResponse = response.text.trim();
        const quizData = JSON.parse(jsonResponse);
        
        if (!Array.isArray(quizData)) {
            throw new Error("AI returned data in an unexpected format.");
        }

        return quizData as QuizQuestion[];

    } catch (error) {
        console.error("Error generating quiz:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Failed to generate quiz: The AI returned an invalid JSON response.");
        }
        throw new Error("Failed to generate quiz due to an API error. Check if your API key is valid.");
    }
};

export const answerQuestionFromNotes = async (
    question: string,
    summaryContent: string,
    originalContent: string
): Promise<string> => {
    try {
        const prompt = `You are a helpful study assistant. Your task is to answer the user's question based ONLY on the provided "Summary" and "Original Notes". Do not use any external knowledge. If the answer cannot be found in the provided texts, say "I cannot find the answer in the provided notes." Be brief and to the point.

        User's Question:
        ---
        ${question}
        ---

        Summary:
        ---
        ${summaryContent}
        ---

        Original Notes:
        ---
        ${originalContent}
        ---
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.1,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error answering question:", error);
        throw new Error("Failed to get an answer due to an API error. Check if your API key is valid.");
    }
};

// General conversational assistant (used when no summary context is provided)
export const chatWithAssistant = async (question: string): Promise<string> => {
    try {
        const prompt = `You are a helpful assistant. Answer the user's question conversationally and concisely. Do not hallucinate facts; if unknown, say you don't know.\n\nUser's Question:\n---\n${question}\n---`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.6 }
        });

        return response.text;
    } catch (error) {
        console.error('Error in chatWithAssistant:', error);
        throw new Error('Failed to get assistant response.');
    }
};