import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: process.env.NODE_ENV === 'production',
  apiVersion: '2024-01-01',
})

export interface LandingPageData {
  bio?: string
  contact?: string
  email?: string
  copyright?: string
  smokingDuration?: number
  burnAccelerationFactor?: number
}

export async function getLandingPageData(): Promise<LandingPageData> {
  try {
    const query = `*[_type == "landingPage"][0]`
    const data = await sanityClient.fetch(query)
    return data || {}
  } catch (error) {
    console.error('Error fetching landing page data:', error)
    return {
      bio: 'Cherry Cigarette Productions is a full service production company specializing in lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque nulla, rhoncus id semper vitae, rutrum ac lectus. Pellentesque finibus, neque vitae vulputate viverra, purus leo laoreet.',
      contact: 'CONTACT',
      email: 'info@cherrycigarette.productions',
      smokingDuration: 10,
      burnAccelerationFactor: 3,
    }
  }
}

