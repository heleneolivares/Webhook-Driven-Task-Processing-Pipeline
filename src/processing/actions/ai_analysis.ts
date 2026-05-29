import { GoogleGenerativeAI } from '@google/generative-ai'

type AiAnalysisConfig = {
  prompt?: string
}

type AiAnalysisResult = {
  originalPayload: Record<string, unknown>
  analysis: string
  processedAt: string
}

export async function applyAiAnalysis(
  payload: Record<string, unknown>,
  config: AiAnalysisConfig
): Promise<AiAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const customPrompt = config.prompt || ''

  const prompt = `
    Analyze the following data and generate a clear, human-readable summary in English.
    ${customPrompt ? `Additional instructions: ${customPrompt}` : ''}
    
    Data to analyze:
    ${JSON.stringify(payload, null, 2)}
    
    Please provide:
    1. A clear summary of what this data represents
    2. Key points or important insights
    3. A recommendation if applicable
    
    Respond concisely and in natural language.
  `

  const result = await model.generateContent(prompt)
  const analysis = result.response.text()

  return {
    originalPayload: payload,
    analysis,
    processedAt: new Date().toISOString()
  }
}