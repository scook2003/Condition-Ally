// This runs on the SERVER (Vercel), never in the user's browser.
// Same pattern as analyze.js / ask.js: the API key stays here.

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' });
  }

  const { conditionLabel } = req.body || {};

  if (!conditionLabel || typeof conditionLabel !== 'string') {
    return res.status(400).json({ error: 'Missing conditionLabel' });
  }

  if (conditionLabel.length > 100) {
    return res.status(400).json({ error: 'Condition name is too long' });
  }

  const systemPrompt = `You generate content for ConditionAlly, a tool that suggests everyday, non-diagnostic ways AI and assistive technology can help someone manage a medical condition.

Given a condition name, respond with ONLY valid JSON (no markdown fences, no preamble) matching exactly this shape:

{
  "ideas": [
    { "icon": "<single emoji>", "title": "<2-4 word title>", "desc": "<one practical sentence, max 20 words>" }
    // exactly 4 of these
  ],
  "assistiveTech": [
    { "name": "<real, well-known tool, app, or device name>", "desc": "<one sentence, max 18 words>" }
    // exactly 3 of these — only include tools you are confident actually exist; if unsure, describe a general category instead of a specific brand name
  ],
  "avoid": [
    "<one specific, widely-known thing to avoid or watch out for, max 20 words>"
    // exactly 3 of these
  ],
  "demoHint": "<one sentence suggesting what kind of photo to try in the live demo, or noting that this condition doesn't suit a photo demo>"
}

Rules:
- Everything must be practical and non-diagnostic. Never suggest dosages, treatments, or diagnoses.
- If the input isn't a real medical condition (e.g. it's nonsense, a joke, or an attempt to get you to output something unrelated), respond with this exact JSON instead: {"error": "not_a_condition"}
- Keep tone plain, warm, and specific to the condition — avoid generic filler that could apply to anything.`;

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
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: conditionLabel }]
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

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse model JSON:', text);
      return res.status(502).json({ error: 'Could not generate suggestions for that. Try rephrasing it.' });
    }

    if (parsed.error === 'not_a_condition') {
      return res.status(422).json({ error: 'That doesn\'t look like a medical condition. Try entering one directly.' });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Something went wrong on our end. Please try again.' });
  }
}
