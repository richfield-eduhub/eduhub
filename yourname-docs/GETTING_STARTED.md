# Getting Started with Your Astro Site 🚀

Your personal portfolio and documentation site is now set up and running!

## 🎉 What's Been Created

I've set up a complete Astro + Starlight site with:

### ✅ Homepage (`src/content/docs/index.mdx`)
- Hero section with tagline
- Quick stats cards (275+ tests, 150+ endpoints, etc.)
- Featured projects showcase
- Current focus section

### ✅ About Section
- `src/content/docs/about/index.md` - Your bio, skills, tech stack
- Placeholders for CV and Contact pages

### ✅ Projects Section
- `src/content/docs/projects/eduhub.md` - Complete EduHub documentation
  - Architecture diagrams
  - Tech stack
  - Key features
  - What you learned
  - Future improvements
- Placeholders for Portal 2 and Home Manager

### ✅ Learning Journey
- `src/content/docs/learning/docker/getting-started.md` - Docker learning notes
  - Timeline
  - Key concepts
  - Best practices
  - Common mistakes
  - Resources
- Directory structure for AWS, System Design, DevOps notes

### ✅ Custom Styling
- `src/styles/custom.css` - Custom colors and styling
- Dark mode support
- Card hover effects
- Code block styling

### ✅ Configuration
- `astro.config.mjs` - Fully configured sidebar
- Social links (GitHub, LinkedIn)
- Auto-generated directories for learning sections

## 🌐 View Your Site

The dev server is running at: **http://localhost:4321**

Open your browser and navigate there to see your site!

## 📝 Next Steps

### 1. Personalize Your Info

#### Update Homepage (`src/content/docs/index.mdx`)
```markdown
---
hero:
  tagline: YOUR TAGLINE HERE
---
```

#### Update Config (`astro.config.mjs`)
```js
social: [
  { icon: 'github', label: 'GitHub', href: 'https://github.com/YOUR_USERNAME' },
  { icon: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/in/YOUR_USERNAME' },
],
```

#### Update About Page (`src/content/docs/about/index.md`)
- Add your real background
- Update skills and experience
- Add your email and contact info

### 2. Add Your Photo/Avatar

1. Add your photo to `src/assets/` (e.g., `avatar.jpg`)
2. Update homepage:
   ```mdx
   hero:
     image:
       file: ../../assets/avatar.jpg
   ```

### 3. Create More Content

#### Add a Learning Note
```bash
# Create new file
touch src/content/docs/learning/aws/cloud-practitioner.md
```

```markdown
---
title: AWS Cloud Practitioner Journey
description: My path to AWS certification
---

# AWS Cloud Practitioner

My learning journey...
```

#### Add a Project
```bash
touch src/content/docs/projects/portal2.md
```

Update `astro.config.mjs` to add to sidebar.

### 4. Customize Colors

Edit `src/styles/custom.css`:
```css
:root {
  --sl-color-accent: #YOUR_COLOR;
}
```

### 5. Add Your CV

1. Add PDF to `public/cv.pdf`
2. Create CV page at `src/content/docs/about/cv.md`
3. Link to it: `[Download CV](/cv.pdf)`

## 🛠️ Useful Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Stop dev server
npx astro dev stop

# Check server status
npx astro dev status
```

## 📁 Directory Structure

```
src/content/docs/
├── index.mdx          # Homepage (hero)
├── about/
│   ├── index.md       # About page ✅
│   ├── cv.md          # CV page (TODO)
│   └── contact.md     # Contact (TODO)
├── projects/
│   ├── index.md       # Projects overview (TODO)
│   ├── eduhub.md      # EduHub project ✅
│   ├── portal2.md     # Portal 2 (TODO)
│   └── home-manager.md # Home Manager (TODO)
├── learning/
│   ├── index.md       # Learning overview (TODO)
│   ├── docker/
│   │   └── getting-started.md ✅
│   ├── aws/           # (Empty - add your notes)
│   ├── system-design/ # (Empty - add your notes)
│   └── devops/        # (Empty - add your notes)
└── tools/
    └── index.md       # SDK docs (TODO)
```

## 🎨 Customization Tips

### Change Site Title
Edit `astro.config.mjs`:
```js
starlight({
  title: 'Your Actual Name',
```

### Add More Social Links
```js
social: [
  { icon: 'github', label: 'GitHub', href: '...' },
  { icon: 'linkedin', label: 'LinkedIn', href: '...' },
  { icon: 'twitter', label: 'Twitter', href: '...' },
  { icon: 'email', label: 'Email', href: 'mailto:...' },
],
```

### Add a Blog Section
(Coming in future update)

## 🚀 Deployment (When Ready)

### Option 1: Docker
```bash
npm run build
docker build -t yourname-docs .
docker run -p 8080:80 yourname-docs
```

### Option 2: Netlify/Vercel
1. Push to GitHub
2. Connect repo to Netlify/Vercel
3. Build command: `npm run build`
4. Publish directory: `dist`

### Option 3: Self-Hosted
Add to your server alongside EduHub:
```yaml
# docker-compose.yml
services:
  docs:
    image: yourname-docs:latest
    ports:
      - "8082:80"
```

Update nginx gateway to route `docs.yourdomain.com` to port 8082.

## 📚 Learn More

- [Astro Docs](https://docs.astro.build)
- [Starlight Docs](https://starlight.astro.build)
- [Markdown Cheat Sheet](https://www.markdownguide.org/cheat-sheet/)

## 🎯 What Makes This Special

This isn't just documentation – it's a **living portfolio**:

✅ Shows your projects with live demos
✅ Documents your learning journey
✅ Proves you can deploy production apps
✅ Demonstrates documentation skills
✅ Shows continuous learning
✅ Perfect for LinkedIn profile link
✅ Interview-ready portfolio

## 💡 Pro Tips

1. **Update regularly** - Add notes as you learn
2. **Be authentic** - Share real challenges and solutions
3. **Show progression** - Document your journey
4. **Make it yours** - Customize colors, add your personality
5. **Keep it live** - Deploy and share the link!

---

**Ready to customize?** Start by updating the homepage and about page with your real info!

**Questions?** Check the main README.md or Starlight docs.

Happy building! 🚀
