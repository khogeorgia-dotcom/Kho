import { useEffect, useState } from 'react'

export default function ContactOverlay({ t, open, onClose, lang = 'ru' }) {
  const [form, setForm] = useState({ name: '', phone: '' })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    const onEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onEsc)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="contact-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
        <button className="contact-close" type="button" onClick={onClose} aria-label={t.contactForm.close}>×</button>
        <h3>{t.contactForm.title}</h3>
        <form
          className="contact-form"
          onSubmit={async (e) => {
            e.preventDefault()
            setSending(true)
            setError('')
            setSubmitted(false)
            try {
              const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: form.name,
                  phone: form.phone,
                  lang,
                  page: window.location.href,
                }),
              })
              const payload = await response.json().catch(() => ({}))
              if (!response.ok) throw new Error(payload?.error || 'Request failed')
              setSubmitted(true)
              setForm({ name: '', phone: '' })
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Request failed')
            } finally {
              setSending(false)
            }
          }}
        >
          <input
            type="text"
            placeholder={t.contactForm.name}
            value={form.name}
            onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
            required
          />
          <input
            type="tel"
            placeholder={t.contactForm.phone}
            value={form.phone}
            onChange={(e) => setForm((v) => ({ ...v, phone: e.target.value }))}
            required
          />
          <button type="submit" disabled={sending}>{sending ? 'Sending...' : t.contactForm.submit}</button>
          {submitted ? <p className="contact-success">{t.contactForm.success}</p> : null}
          {error ? <p className="contact-error">{error}</p> : null}
        </form>
      </div>
    </div>
  )
}
