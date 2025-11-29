import { defineType, defineField } from 'sanity'

export const landingPageSchema = defineType({
  name: 'landingPage',
  title: 'Landing Page',
  type: 'document',
  fields: [
    defineField({
      name: 'siteTitle',
      title: 'Site Title',
      type: 'string',
      description: 'The site title displayed in the browser tab',
      initialValue: 'Cherry Cigarette Productions',
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon (.ico)',
      type: 'image',
      description: 'Main favicon file (.ico format)',
      options: {
        accept: '.ico',
      },
    }),
    defineField({
      name: 'favicon16',
      title: 'Favicon 16x16',
      type: 'image',
      description: 'Favicon 16x16 PNG',
      options: {
        accept: '.png',
      },
    }),
    defineField({
      name: 'favicon32',
      title: 'Favicon 32x32',
      type: 'image',
      description: 'Favicon 32x32 PNG',
      options: {
        accept: '.png',
      },
    }),
    defineField({
      name: 'androidChrome192',
      title: 'Android Chrome 192x192',
      type: 'image',
      description: 'Android Chrome icon 192x192 PNG',
      options: {
        accept: '.png',
      },
    }),
    defineField({
      name: 'androidChrome512',
      title: 'Android Chrome 512x512',
      type: 'image',
      description: 'Android Chrome icon 512x512 PNG',
      options: {
        accept: '.png',
      },
    }),
    defineField({
      name: 'appleTouchIcon',
      title: 'Apple Touch Icon',
      type: 'image',
      description: 'Apple Touch Icon PNG',
      options: {
        accept: '.png',
      },
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      description: 'Company bio/description',
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      description: 'SEO meta description (falls back to Bio if not set)',
      rows: 3,
    }),
    defineField({
      name: 'metaKeywords',
      title: 'Meta Keywords',
      type: 'string',
      description: 'SEO meta keywords (comma-separated)',
    }),
    defineField({
      name: 'contact',
      title: 'Contact Label',
      type: 'string',
      description: 'Contact section label (e.g., "CONTACT")',
      initialValue: 'CONTACT',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      description: 'Contact email address',
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: 'smokingDuration',
      title: 'Smoking Effect Duration',
      type: 'number',
      description: 'Duration of the smoking effect in seconds',
      initialValue: 10,
      validation: (Rule) => Rule.min(1).max(60),
    }),
    defineField({
      name: 'burnAccelerationFactor',
      title: 'Burn Acceleration Factor',
      type: 'number',
      description: 'How much faster the line burns while holding mouse click (1-10)',
      initialValue: 3,
      validation: (Rule) => Rule.min(1).max(10).integer(),
    }),
  ],
  preview: {
    select: {
      title: 'siteTitle',
    },
    prepare({ title }) {
      return {
        title: title || 'Landing Page',
      }
    },
  },
})

