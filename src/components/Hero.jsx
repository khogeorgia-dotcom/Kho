import React from 'react'

export default function Hero({ t }) {
  return (
    <section className="hero">
      <div className="hero-overlay" />
      <div className="container hero-inner">
        <h1>
          {t.heroTitle.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i === 0 ? <br /> : null}
            </React.Fragment>
          ))}
        </h1>
      </div>
    </section>
  )
}
