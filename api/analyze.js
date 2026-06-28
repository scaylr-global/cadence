// Serverless proxy for the live AI box.
// Keeps ANTHROPIC_API_KEY on the server — the browser never sees it.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set' });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await r.json();
    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');

    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: 'Analysis failed' });
  }
}
