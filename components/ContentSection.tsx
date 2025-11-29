'use client'

interface ContentSectionProps {
  bio?: string
  contact?: string
  email?: string
}

export default function ContentSection({ bio, contact, email }: ContentSectionProps) {
  return (
    <div className="flex flex-col gap-8 py-8">

      {/* Bio */}
      {bio && (
        <div className="text-[clamp(0.875rem,1.5vw,1.125rem)] leading-tight max-w-[600px] mt-8">
          {bio}
        </div>
      )}

      {/* Contact Section */}
      <div className="mt-auto pt-16 flex flex-col gap-4">
        {contact && (
          <div className="text-[clamp(0.875rem,1.2vw,1rem)] font-bold tracking-[0.1em]">
            {contact}
          </div>
        )}
        {email && (
          <div className="text-[clamp(0.875rem,1.2vw,1rem)]">
            {email}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8 text-[clamp(0.75rem,1vw,0.875rem)] opacity-80">
        ©2025 CHERRY CIGARETTE PRODUCTIONS
      </div>
    </div>
  )
}

