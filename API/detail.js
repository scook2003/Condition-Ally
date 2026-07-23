// This runs on the SERVER (Vercel), never in the user's browser.

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' });
  }

  const { topic, conditionLabel } = req.body || {};

  if (!topic || typeof topic !== 'string' || topic.length > 150) {
    return res.status(400).json({ error: 'Missing or invalid topic' });
  }

  const systemPrompt = `You write short detail popups for ConditionAlly, a tool suggesting non-diagnostic, everyday ways AI and assistive technology can help someone manage a medical condition.

You'll be given a short topic — an app/device name, an idea title, or a caution item — and the person's condition. Write a brief, plain-language explanation (3-5 sentences, max 90 words) of what it is or means and why it's relevant to that condition.

Rules:
- Never diagnose, prescribe, or give dosages or treatment instructions.
- If the topic names a real product, app, or device: describe what it does in your own words and where someone would generally find it (e.g. "available on iOS and Android app stores"). Do not invent a specific website URL.
- If you are not confident a named product actually exists, say so plainly rather than inventing details about it.
- No markdown, no headers, no bullet points — just plain prose.`;

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
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Topic: "${topic}"\nCondition: "${conditionLabel || 'unspecified'}"` }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return res.status(502).json({ error: 'The AI service returned an error. Please try again.' });
    }

    const data = await response.json();
    const text = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim();

    return res.status(200).json({ text });
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Something went wrong on our end. Please try again.' });
  }
}
