export const callGeminiKeywordExtractor = async (base64Audio, mimeType, apiKey) => {
  const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const promptText = `Analyze this audio chunk. Extract 3 to 5 key terms/keywords spoken in the audio. Return them strictly as a JSON array of strings, e.g. ["example1", "example2"]. Do not wrap the JSON in markdown code blocks or add any other text outside the JSON.`;

  const response = await fetch(apiURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inlineData: { mimeType, data: base64Audio } },
          { text: promptText }
        ]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errJson = await response.json();
    throw new Error(errJson.error?.message || `HTTP error ${response.status}`);
  }

  const resData = await response.json();
  const parsedText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!parsedText) {
    throw new Error("Empty response returned from Gemini API");
  }

  return JSON.parse(parsedText);
};
