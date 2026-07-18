import { ChatMistralAI } from '@langchain/mistralai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

// Set compatibility key for LangChain Mistral SDK
if (process.env.MISTRAL_API && !process.env.MISTRAL_API_KEY) {
  process.env.MISTRAL_API_KEY = process.env.MISTRAL_API;
}

export const getAIResponse = async (userMessage) => {
  try {
    const model = new ChatMistralAI({
      apiKey: process.env.MISTRAL_API || process.env.MISTRAL_API_KEY,
      modelName: 'open-mistral-7b',
      temperature: 0.7,
    });

    const messages = [
      new SystemMessage(
        'You are the AI Support Assistant for the Enterprise Carpooling Platform. ' +
        'Help users with questions about carpooling policies, how to offer or book rides, ' +
        'and how the wallet payments work. ' +
        'The platform supports the following pages for navigation: ' +
        '- Dashboard: "/" (to search and book rides or offer rides) ' +
        '- My Trips: "/trips" (to view active and booked trips) ' +
        '- Ride History: "/history" (to view completed commutes) ' +
        '- My Vehicle: "/vehicle" (to register/approve vehicles) ' +
        '- Wallet: "/wallet" (to view balance and recharge using Razorpay) ' +
        '- Setting: "/settings" (for quick links and profile settings). ' +
        'Guide the user to navigate to these pages if their query concerns these features.'
      ),
      new HumanMessage(userMessage),
    ];

    const res = await model.invoke(messages);
    // Strip markdown formatting characters (asterisks and hashes) for a clean plain-text response display
    const cleanText = res.content
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/###/g, '')
      .replace(/##/g, '')
      .replace(/#/g, '')
      .trim();
    return cleanText;
  } catch (error) {
    console.error('❌ LangChain MistralAI Error:', error);
    return 'Our AI assistant is temporarily offline, but we are here to support you! Feel free to email teamclickjack@gmail.com.';
  }
};

export default { getAIResponse };
