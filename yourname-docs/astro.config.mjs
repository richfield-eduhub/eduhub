// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Your Name - Portfolio & Docs',
			description: 'Full-Stack Engineer | DevOps Enthusiast | AWS Certified',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/yourusername' },
				{ icon: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/in/yourusername' },
			],
			sidebar: [
				{
					label: 'About',
					items: [
						{ label: 'About Me', slug: 'about' },
						{ label: 'CV / Resume', slug: 'about/cv' },
						{ label: 'Contact', slug: 'about/contact' },
					],
				},
				{
					label: 'Projects',
					items: [
						{ label: 'Overview', slug: 'projects' },
						{ label: 'EduHub', slug: 'projects/eduhub' },
						{ label: 'Portal 2', slug: 'projects/portal2' },
						{ label: 'Home Manager', slug: 'projects/home-manager' },
					],
				},
				{
					label: 'Learning Journey',
					items: [
						{ label: 'Overview', slug: 'learning' },
						{
							label: 'Docker & Containers',
							items: [{ autogenerate: { directory: 'learning/docker' } }],
						},
						{
							label: 'AWS Certifications',
							items: [{ autogenerate: { directory: 'learning/aws' } }],
						},
						{
							label: 'System Design',
							items: [{ autogenerate: { directory: 'learning/system-design' } }],
						},
						{
							label: 'CI/CD & DevOps',
							items: [{ autogenerate: { directory: 'learning/devops' } }],
						},
					],
				},
				{
					label: 'Tools & SDKs',
					items: [
						{ label: 'Overview', slug: 'tools' },
						// Add your SDKs here as you build them
					],
				},
				{
					label: 'Blog',
					link: '/blog',
				},
			],
			// Customize the theme
			customCss: [
				'./src/styles/custom.css',
			],
		}),
	],
});
