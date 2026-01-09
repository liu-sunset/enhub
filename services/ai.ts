import { SYSTEM_PROMPT } from './prompts';

export const generateHtmlFromImages = async (
  images: string[], // base64 strings
  model: string,
  apiKey: string,
  baseUrl: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");

  // Clean baseUrl: remove trailing slash
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const url = `${cleanBaseUrl}/chat/completions`;

  // Merge system prompt into user message for better compatibility with Vision models
  const messages = [
    {
      role: "user",
      content: [
        { 
          type: "text", 
          text: `${SYSTEM_PROMPT}\n\nIMPORTANT: Please digitize the attached pages into the requested HTML format.` 
        },
        ...images.map(base64 => ({
          type: "image_url",
          image_url: {
            url: base64
          }
        }))
      ]
    }
  ];

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: false
      })
    });

    if (!response.ok) {
        let errorMsg = `API Request Failed: ${response.status} ${response.statusText}`;
        try {
            const err = await response.json();
            // Try to find the most specific error message from response
            const details = err.error?.message || err.message || JSON.stringify(err);
            errorMsg = `Provider Error: ${details}`;
        } catch (e) {
            // response was not JSON
        }
        throw new Error(errorMsg);
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content || "";

    // Cleanup potential markdown formatting if the model disobeys
    content = content.replace(/^```html\s*/, '').replace(/\s*```$/, '');
    
    return content;
  } catch (error) {
    console.error("AI Service Error:", error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error("Network error: Failed to connect to AI service. This is likely a CORS issue (browser blocking the request) or the file size is too large. Please check your Base URL settings or try using a proxy.");
    }
    throw error;
  }
};