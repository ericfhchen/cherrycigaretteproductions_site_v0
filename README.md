# Cherry Cigarette Productions Landing Page

A Next.js landing page with Sanity CMS integration featuring an interactive "smoking" animation effect.

## Features

- Interactive smoking animation that inverts colors from red text on black background to black text on red background
- Shrinking red line at the top that depletes over time
- Click/touch interactions to accelerate the burn effect
- Crosshair cursor that follows mouse/touch while holding
- Content management via Sanity CMS
- Responsive grid layout (151:349 ratio)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Sanity

1. Create a new Sanity project at [sanity.io](https://www.sanity.io)
2. Copy `.env.example` to `.env.local`
3. Add your Sanity project ID and dataset to `.env.local`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
```

### 3. Run Sanity Studio (Optional)

To manage content through Sanity Studio:

```bash
npx sanity init
npx sanity dev
```

The studio will be available at `http://localhost:3333`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## Content Management

The following fields can be edited through Sanity CMS:

- **Bio**: Company description/bio text
- **Contact Label**: Label for the contact section (default: "CONTACT")
- **Email**: Contact email address
- **Smoking Duration**: Duration of the smoking effect in seconds (default: 10)

## Project Structure

```
/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main landing page
│   └── globals.css        # Global styles
├── components/
│   ├── SmokingEffect.tsx  # Main smoking animation component
│   ├── BurningLine.tsx    # Top shrinking line element
│   ├── Crosshair.tsx      # Cursor crosshair component
│   └── ContentSection.tsx # Content display component
├── lib/
│   └── sanity.ts          # Sanity client configuration
├── schemas/
│   └── landingPage.ts     # Sanity schema for editable content
└── sanity.config.ts       # Sanity configuration
```

## How It Works

1. **Initial State**: Red text on black background, full red line at top
2. **Smoking Animation**: Colors gradually invert over the configured duration (default 10 seconds), line shrinks
3. **Click Interaction**: Clicking/touching accelerates the burn effect
4. **Completion**: When complete, page fades back to red on black, line fully depleted
5. **Prompt**: "light another?" text appears, clicking it restarts the effect

## Customization

- Add your logo in the first column of the grid layout (currently shows a placeholder)
- Adjust colors, fonts, and spacing in `app/globals.css` and component files
- Modify animation timing in the `SmokingEffect` component


