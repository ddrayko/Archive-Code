-- Seed some example projects for Drayko's portfolio
INSERT INTO public.projects (title, description, image_url, tags, project_url, github_url)
VALUES
  (
    'E-Commerce Platform',
    'A full-stack e-commerce platform built with Next.js, featuring product management, shopping cart, and payment integration.',
    '/placeholder.svg?height=400&width=600',
    ARRAY['Next.js', 'React', 'TypeScript', 'Stripe'],
    'https://example.com/ecommerce',
    'https://github.com/drayko/ecommerce'
  ),
  (
    'AI Chat Application',
    'Real-time chat application powered by AI, with natural language processing and smart responses.',
    '/placeholder.svg?height=400&width=600',
    ARRAY['AI', 'Next.js', 'WebSocket', 'OpenAI'],
    'https://example.com/ai-chat',
    'https://github.com/drayko/ai-chat'
  ),
  (
    'Task Management System',
    'Collaborative task management tool with real-time updates, team collaboration features, and analytics.',
    '/placeholder.svg?height=400&width=600',
    ARRAY['React', 'Node.js', 'PostgreSQL', 'WebSocket'],
    'https://example.com/tasks',
    'https://github.com/drayko/task-manager'
  ),
  (
    'Portfolio Website',
    'Modern portfolio website with dynamic content management and beautiful animations.',
    '/placeholder.svg?height=400&width=600',
    ARRAY['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    'https://example.com/portfolio',
    'https://github.com/drayko/portfolio'
  );
