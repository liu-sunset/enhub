export const generateHtmlFromImages = async (
  images: string[], // base64 strings
  englishText: string, // optional english text
  model: string,
  apiKey: string,
  baseUrl: string,
  systemPrompt: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");

  // Clean baseUrl: remove trailing slash
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const url = `${cleanBaseUrl}/chat/completions`;

  // Merge system prompt into user message for better compatibility with Vision models
  console.log("System Prompt being sent:", systemPrompt);
  const content: any[] = [
    { 
      type: "text", 
      text: `${systemPrompt}\n\nIMPORTANT: Please digitize the attached pages into the requested HTML format.${englishText ? `\n\nReference English Text:\n${englishText}` : ''}` 
    }
  ];

  if (images.length > 0) {
    content.push(...images.map(base64 => ({
      type: "image_url",
      image_url: {
        url: base64
      }
    })));
  }

  const messages = [
    {
      role: "user",
      content: content
    }
  ];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

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
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

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
  } catch (error: any) {
    console.error("AI Service Error:", error);
    if (error.name === 'AbortError') {
        throw new Error("Request timed out after 60 seconds.");
    }
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error("Network error: Failed to connect to AI service. This is likely a CORS issue (browser blocking the request) or the file size is too large. Please check your Base URL settings or try using a proxy.");
    }
    throw error;
  }
};