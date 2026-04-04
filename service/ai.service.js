import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage } from "langchain";

const modelName = process.env.MISTRAL_MODEL || "mistral-small-latest";

const model = new ChatMistralAI({
  model: modelName,
  apiKey: process.env.MISTRAL_API_KEY,
});

const latestIntentPattern =
  /\b(latest|today|current|recent|news|update|up[-\s]?to[-\s]?date|price|stock|weather|score|happening|now)\b/i;

const searchTavily = async (query) => {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "advanced",
        max_results: 8,
        include_answer: true,
        include_raw_content: false,
      }),
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.log("Tavily search failed:", error?.message || error);
    return null;
  }
};

const buildWebContext = (searchResult) => {
  if (!searchResult) return "";

  const answer = searchResult?.answer
    ? `Tavily summary: ${searchResult.answer}\n`
    : "";
  const sources = (searchResult?.results || [])
    .slice(0, 5)
    .map((item, index) => {
      const title = item?.title || `Source ${index + 1}`;
      const url = item?.url || "";
      const snippet = (item?.content || "").slice(0, 420);
      return `- ${title}\n  URL: ${url}\n  Snippet: ${snippet}`;
    })
    .join("\n");

  return `${answer}\nSources:\n${sources}`.trim();
};

export const generateResponse = async (message, history = null) => {
  const shouldFetchLatestContext = latestIntentPattern.test(message);
  const hasTavilyKey = Boolean(process.env.TAVILY_API_KEY);

  if (shouldFetchLatestContext && !hasTavilyKey) {
    return [
      "I cannot guarantee latest real-time data right now because `TAVILY_API_KEY` is not configured.",
      "",
      "Please add `TAVILY_API_KEY` in backend `.env` and restart the server.",
    ].join("\n");
  }

  const tavilyData = shouldFetchLatestContext
    ? await searchTavily(message)
    : null;
  const webContext = buildWebContext(tavilyData);

  const humanContent = webContext
    ? `User question:\n${message}\n\nWeb context from Tavily:\n${webContext}`
    : message;

  const prompt = history ? `Conversation history:\n${history}\n\n${humanContent}` : humanContent;

  const response = await model.invoke([
    new SystemMessage(
      `You are askViraj, a reliable AI assistant.
Active model: ${modelName}.
Current date context: ${new Date().toISOString()}.
If web context is provided, prioritize it for time-sensitive or latest-data questions.
When using web context, cite source URLs in markdown bullet points at the end under "Sources".
If web context is missing for a latest-data question, clearly mention that the answer may be outdated.`,
    ),
    new HumanMessage(prompt),
  ]);

  return response.text;
};

export const generateTitle = async (message) => {
  const response = await model.invoke([
    new SystemMessage(
      "You are a helpful assistant that generates a short title (2-3 words) for a chat. No emojis, no special characters.",
    ),
    new HumanMessage(message),
  ]);

  return response.text;
};
