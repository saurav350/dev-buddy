import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const modelName = process.env.MODEL || 'llama-3.3-70b-versatile';

const sendChatRequest = async (messages) => {
    try {
        const userMessage = messages[messages.length - 1]?.content || "Hi";
        
        const completion = await groq.chat.completions.create({
            model: modelName,
            messages: [
                { role: "system", content: "You are a helpful coding assistant." },
                { role: "user", content: userMessage }
            ],
        });

        return {
            text: completion.choices[0]?.message?.content || 'No response from Groq.'
        };
    } catch (error) {
        console.error('Groq API Error:', error);
        throw error;
    }
};

export default { sendChatRequest };