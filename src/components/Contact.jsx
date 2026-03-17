import { useState } from 'react'
import SectionWrapper from './ui/SectionWrapper'
import { loadContactConfig } from '../utils/crypto'

export default function Contact() {
  const [config] = useState(loadContactConfig)

  return (
    <SectionWrapper id="contact" className="text-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-4">{config.heading}</h2>
      <p className="text-gray-400 mb-8">
        {config.message}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {config.email && (
          <a
            href={`mailto:${config.email}`}
            className="px-6 py-3 border border-gray-700 hover:border-accent rounded-full text-gray-300 hover:text-accent transition-colors"
          >
            {config.email}
          </a>
        )}
        {config.linkedinUrl && (
          <a
            href={config.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-gray-700 hover:border-accent rounded-full text-gray-300 hover:text-accent transition-colors"
          >
            {config.linkedinLabel || 'LinkedIn'}
          </a>
        )}
      </div>
      <p className="mt-16 text-gray-600 text-sm">
        {config.copyright}
      </p>
    </SectionWrapper>
  )
}
