import './globals.css'
import localFont from 'next/font/local'
import { getLandingPageData, sanityClient } from '@/lib/sanity'
import imageUrlBuilder from '@sanity/image-url'
import type { Metadata } from 'next'

const font = localFont({
  src: '../public/fonts/BIZUDMincho-Bold.woff2',
  variable: '--font-custom',
  display: 'swap',
})

const builder = imageUrlBuilder(sanityClient)

function urlFor(source: any) {
  if (!source) return null
  return builder.image(source).url()
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getLandingPageData()
  const siteTitle = data.siteTitle || 'Cherry Cigarette Productions'
  
  const icons: Metadata['icons'] = {}
  const iconArray: Array<{ url: string; sizes?: string; type?: string }> = []
  
  // Add PNG favicons with sizes
  if (data.favicon16) {
    const url = urlFor(data.favicon16)
    if (url) {
      iconArray.push({ url, sizes: '16x16', type: 'image/png' })
    }
  }
  
  if (data.favicon32) {
    const url = urlFor(data.favicon32)
    if (url) {
      iconArray.push({ url, sizes: '32x32', type: 'image/png' })
    }
  }
  
  // Set icon(s) - use array if multiple, single object if one
  if (iconArray.length > 0) {
    icons.icon = iconArray.length === 1 ? iconArray[0] : iconArray
  }
  
  if (data.appleTouchIcon) {
    const url = urlFor(data.appleTouchIcon)
    if (url) {
      icons.apple = url
    }
  }
  
  const manifestIcons: Array<{ url: string; sizes: string; type: string }> = []
  if (data.androidChrome192) {
    const url = urlFor(data.androidChrome192)
    if (url) {
      manifestIcons.push({
        url,
        sizes: '192x192',
        type: 'image/png'
      })
    }
  }
  if (data.androidChrome512) {
    const url = urlFor(data.androidChrome512)
    if (url) {
      manifestIcons.push({
        url,
        sizes: '512x512',
        type: 'image/png'
      })
    }
  }
  
  if (manifestIcons.length > 0) {
    icons.other = manifestIcons
  }
  
  // Meta description falls back to bio if not set
  const description = data.metaDescription || data.bio || undefined
  
  // Meta keywords
  const keywords = data.metaKeywords || undefined
  
  return {
    title: siteTitle,
    description,
    keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
    icons: Object.keys(icons).length > 0 ? icons : undefined,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={font.variable}>{children}</body>
    </html>
  )
}
