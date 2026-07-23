// This runs on the SERVER (Vercel), never in the user's browser.
// Your API key lives here, in an environment variable — it never
// gets sent to the person visiting the site.

// Vercel's default function timeout (10s on the free tier) is often too
// short for a photo analysis round-trip. This raises it to 60s.
export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' });
  }

  const { conditionLabel, mediaType, base64 } = req.body || {};

  if (!base64 || !mediaType || !conditionLabel) {
    return res.status(400).json({ error: 'Missing conditionLabel, mediaType, or base64 image data' });
  }

  // Basic sanity limit so nobody can send you a huge bill with a giant payload.
  if (base64.length > 8_000_000) {
    return res.status(400).json({ error: 'Image too large' });
  }

  const prompt = `The person managing "${conditionLabel}" uploaded this photo. It might be a menu, a food label, an ingredient list, a form, or something else relevant to their condition.

Give practical, non-diagnostic suggestions: e.g. which items look better or worse suited to their condition and why, or anything worth double-checking. Use short bullet points. Do NOT provide a diagnosis, a dosage, or medical treatment instructions. If the photo isn't clearly related to the condition, just describe what's in it plainly and note that. Keep the whole reply under 150 words.`;

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
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: prompt }
          ]
        }]
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
