import { useEffect, useState } from 'react'

export default function ContactOverlay({ t, open, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '' })
  const [submitted, setSubmitted] = useState(false)

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
          onSubmit={(e) => {
            e.preventDefault()
            setSubmitted(true)
            setForm({ name: '', phone: '' })
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
          <button type="submit">{t.contactForm.submit}</button>
          {submitted ? <p className="contact-success">{t.contactForm.success}</p> : null}
        </form>
      </div>
    </div>
  )
}
