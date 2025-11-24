import { GoogleGenAI } from "@google/genai";
import { AppState, Transaction } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateFinancialInsight = async (state: AppState, userQuery: string): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    
    // Summarize recent history for context
    const recentTransactions = state.transactions.slice(0, 10).map(t => 
      `${t.date.split('T')[0]}: ${t.type} of $${t.amount} (${t.description}) [Method: ${t.method || 'N/A'}]`
    ).join('\n');

    const bankInfo = state.config.payeeBankDetails 
        ? `Bank: ${state.config.payeeBankDetails.bankName}, Account ending in ${state.config.payeeBankDetails.accountNumber.slice(-4)}`
        : 'No bank account linked yet';

    const systemContext = `
      You are RentPacer AI, a helpful financial assistant for a roommate rent management app.
      The user pays rent in advance into a holding wallet (via Stripe), and the app releases it weekly to their roommate (the landlord contact).
      
      Current Balance: $${state.balance}
      Weekly Rent Amount: $${state.config.weeklyAmount}
      Payee: ${state.config.payeeName}
      Payee Bank Info: ${bankInfo}
      Next Payment Due: ${state.config.nextReleaseDate.split('T')[0]}
      
      Recent Transactions:
      ${recentTransactions}
      
      Answer the user's question briefly and helpfully based on this data. 
      If they ask for a message to send to their roommate, draft a polite text confirming the transfer details.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: userQuery,
      config: {
        systemInstruction: systemContext,
      }
    });

    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the AI service right now. Please check your API key.";
  }
};

export const analyzeSpendingHabits = async (transactions: Transaction[]): Promise<string> => {
    try {
        const model = "gemini-2.5-flash";
        const txData = JSON.stringify(transactions.slice(0, 20));
        
        const response = await ai.models.generateContent({
            model,
            contents: `Analyze these rent transactions and give a 1-sentence summary of my consistency: ${txData}`,
        });
        return response.text || "Analysis unavailable.";
    } catch (e) {
        return "Could not analyze data.";
    }
}