const RESEND_ENDPOINT = 'https://api.resend.com/emails'

const bad = (res, status, error) => {
  res.status(status).json({ ok: false, error })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return bad(res, 405, 'Method not allowed')

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  const to = process.env.RESEND_TO_EMAIL

  if (!apiKey || !from || !to) {
    return bad(res, 500, 'Missing RESEND env vars')
  }

  const name = String(req.body?.name || '').trim()
  const phone = String(req.body?.phone || '').trim()
  const page = String(req.body?.page || '').trim()
  const lang = String(req.body?.lang || 'ru').trim()

  if (!name || !phone) return bad(res, 400, 'Name and phone are required')

  const subject = `KHO: New contact request (${lang.toUpperCase()})`
  const text = [
    'New contact request from kho.ge',
    '',
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Language: ${lang}`,
    page ? `Page: ${page}` : '',
    `Time: ${new Date().toISOString()}`,
  ]
    .filter(Boolean)
    .join('\n')

  const html = `
    <h2>New contact request from kho.ge</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Language:</strong> ${lang.toUpperCase()}</p>
    ${page ? `<p><strong>Page:</strong> ${page}</p>` : ''}
    <p><strong>Time:</strong> ${new Date().toISOString()}</p>
  `

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text,
        html,
      }),
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      return bad(res, 502, payload?.message || 'Resend request failed')
    }

    return res.status(200).json({ ok: true, id: payload?.id || null })
  } catch (error) {
    return bad(res, 500, error instanceof Error ? error.message : 'Unknown error')
  }
}

