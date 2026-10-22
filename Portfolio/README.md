# Nithya Rathinavelu: portfolio website

Built with Next.js. All pages: home, About, and the four case studies.

## Put it online with Vercel (free)

1. Create a free account at vercel.com (signing up with GitHub is easiest).
2. Put this folder on GitHub: create a new repository, then upload the contents of this folder (or use GitHub Desktop).
3. In Vercel, choose **Add New → Project**, pick the repository, and press **Deploy**. Vercel detects Next.js automatically.
4. You get a link like `nithya-portfolio.vercel.app` to share. Every change you push to GitHub updates it automatically.
5. Later, connect your own domain in Vercel under **Project → Settings → Domains**.

## Run it on your computer (optional)

```
npm install
npm run dev
```
Then open http://localhost:3000

## Images to replace

Export these from Figma and save them in `public/images/` with exactly these names (overwrite the placeholders).

| File | What to export | Size |
|---|---|---|
| hero-arch-1.jpg | Maze image (Complicated) | 1024 × 1536 |
| hero-arch-2.jpg | Path image (Shaping) | 1024 × 1536 |
| hero-arch-3.jpg | Open arch image (Obvious) | 1024 × 1536 |
| logo-on-dark.png | Ivory tile with green NR | 256 × 256 |
| logo-on-light.png | Green tile with ivory NR | 256 × 256 |
| cover-conversational-ai.jpg | Built screen: assistant beside the canvas | 1336 wide |
| cover-design-system.jpg | Assistant answer built from the AI components | 1336 wide |
| cover-esign.jpg | eSign summary screen with the stepper | 1336 wide |
| cover-workflow-builder.jpg | Workflow builder canvas | 1336 wide |

| portrait-about.jpg | You painting at the workshop table (About page) | about 880 × 1120 |
| polaroid-1.jpg | Life in green | 800 × 800 (square) |
| polaroid-2.jpg | Race Weekend | 800 × 800 (square) |
| polaroid-3.jpg | Places & Perspectives | 800 × 800 (square) |
| polaroid-4.jpg | A Study in Style | 800 × 800 (square) |
| polaroid-5.jpg | The Mind Edit | 800 × 800 (square) |

`portrait-home.jpg` is already your doorway photo.

## Where to edit text

- Home page text: `app/page.js`
- Case study content: `data/<case study>.json` (read from the Figma file)
- About page layout: `app/about/page.js` (its text lives in `lib/content.js` under `about`)
- Projects, highlights, steps and contact details: `lib/content.js`
- Hero: `components/Hero.js`
- Colours and layout: `app/globals.css`

## Case study images

Each case study has its own folder: `public/images/work/<case study>/`. Save each image as a JPG with the number shown, for example `01.jpg`. Until a file is added, the page shows a labelled placeholder with the file name, so you can see exactly what goes where.

### Conversational AI: `public/images/work/conversational-ai/`

| File | Image |
|---|---|
| 01.jpg | Cover: the assistant proposing a plan before it acts (blur product names) |
| 02.jpg | A box in the middle of the screen |
| 03.jpg | A panel docked beside the product |
| 04.jpg | A full page for longer work |
| 05.jpg | Large starter-card grids |
| 06.jpg | A short list of suggestions |
| 07.jpg | A dark, immersive direction |
| 08.jpg | A light direction, like the product |
| 09.jpg | Voice input in the conversation |
| 10.jpg | Choosing a specialist agent from the chat |
| 11.jpg | Creating and managing your own agents |
| 12.jpg | A delete plan: count, names, “can’t be undone”, then the question |
| 13.jpg | Three items with the same name, listed with their space and due date |
| 14.jpg | A refusal naming the missing permission, and a total with an access note |
| 15.jpg | Progress steps that name the product being used, and the greyed “Coming soon” panel |
| 16.jpg | A conflict message: “This changed before I could update it” |
| 17.jpg | Choosing an agent without leaving the chat |
| 18.jpg | Managing agents: status, conversations and helpful ratings |
| 19.jpg | As built: Steps that match the request |
| 20.jpg | Refined: Steps that match the request |
| 21.jpg | As built: Show the result before creating it |
| 22.jpg | Refined: Show the result before creating it |
| 23.jpg | As built: Charts with meaning, text first |
| 24.jpg | Refined: Charts with meaning, text first |
| 25.jpg | As built: Feedback without leaving the answer |
| 26.jpg | Refined: Feedback without leaving the answer |
| 27.jpg | Voice and conversation guide |
| 28.jpg | 15 golden conversations |
| 29.jpg | An evaluation scorecard |

### AI-native design system: `public/images/work/design-system/`

| File | Image |
|---|---|
| 01.jpg | Cover: an answer built from the AI components (steps, chart, access note, follow-ups) |
| 02.jpg | Before: the old form components, with inconsistent fonts, sizes and colours |
| 03.jpg | The plan and question, next to the replies that do and don’t count as yes |
| 04.jpg | The four plan variants side by side |
| 05.jpg | A status change the AI declines, with the allowed options it offers instead |
| 06.jpg | Tool steps that shipped, next to the agent components kept for later |
| 07.jpg | Docs site: a component page |
| 08.jpg | Guidelines: confirmation tiers and “what counts as a yes” |
| 09.jpg | Assistant: live steps while it works, built from the AI components |
| 10.jpg | Workflow builder: the assistant beside the canvas, asking before it creates |

### eSign and eStamp: `public/images/work/esign-estamp/`

| File | Image |
|---|---|
| 01.jpg | Cover: the new guided flow |
| 02.jpg | Start: Upload or Template, side by side |
| 03.jpg | The stepper with progress, and one step in focus |
| 04.jpg | Placing signature boxes on the document |
| 05.jpg | The stamping step with state, article and amount |
| 06.jpg | The summary screen before publishing |

### Workflow builder: `public/images/work/workflow-builder/`

| File | Image |
|---|---|
| 01.jpg | Cover: a workflow on the canvas |
| 02.jpg | The canvas: a branching workflow |
| 03.jpg | A node’s page: parameters, input and output, Execute step |
| 04.jpg | The node library, grouped by purpose |
| 05.jpg | Advanced nodes alongside forms and approvals |
| 06.jpg | Starting a workflow |
| 07.jpg | Choosing the next step |
| 08.jpg | Testing a step |
| 09.jpg | Finding what failed |
