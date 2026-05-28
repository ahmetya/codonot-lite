interface GemmaResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                text?: string;
            }>;
        };
    }>;
}

class HelperBotService {
    async askGemma(prompt: string): Promise<string> {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("MissinÍ´g GEMINI_API_KEY environment variable.");

        // Using the Gemma 4 26B Mixture of Experts endpoint
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error (${response.status}): ${errorText}`);
        }

        const data: GemmaResponse = await response.json();

        console.log(data);

        // Navigate Google's deeply nested JSON response safely
        const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return outputText || "No text returned from model.";
    }

}

export const helperBotService = new HelperBotService();