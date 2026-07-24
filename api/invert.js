export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'No text provided' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: `You invert sentences. For each sentence in the user's text, write a new sentence that flips its meaning, stance, or emotional charge while keeping a similar length and register. Do not simply negate with "not" — genuinely invert the idea.
Return ONLY valid JSON, no preamble, no markdown fences, in this exact shape:
{"pairs": [{"original": "...", "inverted": "..."}]}`,
        messages: [
          { role: 'user', content: text }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: 'Anthropic API error', debug: data.error });
    }

    const raw = data.content?.[0]?.text || '{}';

    // TEMPORARY DEBUG - remove once working
    return res.status(200).json({ debugFullResponse: data, debugRawText: raw });

  } catch (err) {
    res.status(500).json({ error: 'Failed to process text', debug: err.message });
  }
}
