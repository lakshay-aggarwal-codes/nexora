import "dotenv/config";
import { ChatGroq } from "@langchain/groq"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

const groq = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0,
    maxTokens: undefined, 
})

const gemini = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-pro",
    temperature: 0, 
})
 
const memoryModel = new ChatGroq({
    model: process.env.MEMORY_MODEL || "openai/gpt-oss-120b",
    temperature: 0,
})

export const getModel = async (agent) => {
    if(agent == 'coding'){
        return gemini
    }
    if(agent == 'memory'){
        return memoryModel
    }
    else return groq
}
