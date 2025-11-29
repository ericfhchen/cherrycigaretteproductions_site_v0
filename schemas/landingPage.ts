import { defineType, defineField } from 'sanity'

export const landingPageSchema = defineType({
  name: 'landingPage',
  title: 'Landing Page',
  type: 'document',
  fields: [
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      description: 'Company bio/description',
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
      options: {
        range: {
          min: 1,
          max: 10,
          step: 1,
        },
      },
    }),
  ],
  preview: {
    select: {
      title: 'email',
    },
  },
})

