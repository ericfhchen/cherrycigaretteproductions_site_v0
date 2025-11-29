import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { landingPageSchema } from './schemas/landingPage'
import './sanity.css'

export default defineConfig({
  name: 'default',
  title: 'Cherry Cigarette Productions',

  projectId: 'uifczba2',
  dataset: 'production',

  plugins: [deskTool()],

  schema: {
    types: [landingPageSchema],
  },

  studio: {
    components: {
      layout: (props) => {
        // Set dark mode on mount
        if (typeof window !== 'undefined') {
          const setDarkMode = () => {
            document.documentElement.setAttribute('data-scheme', 'dark')
          }
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setDarkMode)
          } else {
            setDarkMode()
          }
        }
        return props.renderDefault(props)
      },
    },
  },
})

