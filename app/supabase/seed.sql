-- Sample Categories
INSERT INTO public.categories (name, slug, description, seo_title, seo_description, sort_order) VALUES
('Wedding Templates', 'wedding-templates', 'Beautiful wedding website templates and invitations for your special day', 'Wedding Website Templates | Elegant Designs | Miracute', 'Discover stunning wedding website templates perfect for couples. Easy to customize, mobile-friendly designs.', 1),
('Business Templates', 'business-templates', 'Professional templates for businesses and entrepreneurs', 'Professional Business Website Templates | Miracute', 'Professional business website templates for entrepreneurs, consultants, and companies. Modern, responsive designs.', 2),
('Therapist Templates', 'therapist-templates', 'Calming and professional templates for therapy practices', 'Therapist Website Templates | Wellness & Mental Health | Miracute', 'Professional therapist and wellness website templates. HIPAA-compliant designs for mental health professionals.', 3),
('Portfolio Templates', 'portfolio-templates', 'Creative portfolio templates for artists and designers', 'Portfolio Website Templates | Creative Professionals | Miracute', 'Showcase your work with beautiful portfolio website templates. Perfect for artists, photographers, and designers.', 4),
('Restaurant Templates', 'restaurant-templates', 'Appetizing templates for restaurants and cafes', 'Restaurant Website Templates | Food & Dining | Miracute', 'Delicious restaurant website templates with online menus, reservations, and food photography galleries.', 5),
('E-commerce Templates', 'ecommerce-templates', 'Online store templates for selling products', 'E-commerce Website Templates | Online Store | Miracute', 'Start your online store with professional e-commerce website templates. Mobile-optimized shopping experiences.', 6),
('Blog Templates', 'blog-templates', 'Clean and modern blog templates', 'Blog Website Templates | Personal & Professional | Miracute', 'Beautiful blog website templates for personal bloggers, businesses, and content creators.', 7),
('Landing Pages', 'landing-pages', 'High-converting landing page templates', 'Landing Page Templates | High-Converting | Miracute', 'Professional landing page templates designed for maximum conversions. Perfect for marketing campaigns.', 8);

-- Sample Products
INSERT INTO public.products (
  name, slug, description, short_description, price, compare_at_price, category_id,
  preview_images, file_formats, seo_title, seo_description, tags, 
  difficulty_level, software_required, dimensions, is_featured
) VALUES
-- Wedding Templates
(
  'Elegant Rose Wedding Website', 
  'elegant-rose-wedding-website',
  'A stunning wedding website template featuring elegant rose motifs and romantic typography. Perfect for couples wanting a classic, timeless look for their wedding website. Includes multiple pages for ceremony details, RSVP, photo gallery, and gift registry.',
  'Elegant wedding website template with rose motifs and romantic design',
  29.99, 39.99,
  (SELECT id FROM public.categories WHERE slug = 'wedding-templates'),
  ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800', 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800'],
  ARRAY['HTML', 'CSS', 'JS', 'Figma'],
  'Elegant Rose Wedding Website Template | Romantic Design | Miracute',
  'Beautiful rose-themed wedding website template with RSVP, gallery, and registry pages. Easy to customize.',
  ARRAY['wedding', 'roses', 'elegant', 'romantic', 'template', 'website'],
  'Beginner',
  ARRAY['Any Website Builder', 'HTML Editor'],
  'Responsive Design',
  true
),
(
  'Modern Minimalist Wedding Suite',
  'modern-minimalist-wedding-suite',
  'Clean and contemporary wedding website template with a focus on beautiful typography and whitespace. Includes invitation design, RSVP system, and photo gallery layouts.',
  'Modern minimalist wedding website with clean design and typography',
  34.99, 44.99,
  (SELECT id FROM public.categories WHERE slug = 'wedding-templates'),
  ARRAY['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800'],
  ARRAY['HTML', 'CSS', 'JS', 'PSD'],
  'Modern Minimalist Wedding Website Template | Clean Design | Miracute',
  'Contemporary minimalist wedding website template with elegant typography and clean layouts.',
  ARRAY['wedding', 'minimalist', 'modern', 'clean', 'typography'],
  'Beginner',
  ARRAY['Website Builder', 'Photoshop'],
  'Responsive Design',
  true
),

-- Business Templates
(
  'Professional Consulting Website',
  'professional-consulting-website',
  'A sophisticated business website template designed for consultants and professional services. Features service pages, team profiles, testimonials, and contact forms.',
  'Professional consulting website template for business services',
  39.99, 49.99,
  (SELECT id FROM public.categories WHERE slug = 'business-templates'),
  ARRAY['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800'],
  ARRAY['HTML', 'CSS', 'JS', 'React'],
  'Professional Consulting Website Template | Business Services | Miracute',
  'Sophisticated consulting website template with service pages, team profiles, and client testimonials.',
  ARRAY['business', 'consulting', 'professional', 'services', 'corporate'],
  'Intermediate',
  ARRAY['React', 'Website Builder'],
  'Responsive Design',
  false
),

-- Therapist Templates
(
  'Calm Therapy Practice Website',
  'calm-therapy-practice-website',
  'A soothing and professional website template designed specifically for therapy practices. Features appointment booking, service descriptions, and therapist profiles.',
  'Calming therapy website template with appointment booking',
  44.99, 54.99,
  (SELECT id FROM public.categories WHERE slug = 'therapist-templates'),
  ARRAY['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'],
  ARRAY['HTML', 'CSS', 'JS', 'WordPress'],
  'Therapy Practice Website Template | Mental Health | Miracute',
  'Professional therapy website template with calming design, appointment booking, and service information.',
  ARRAY['therapy', 'mental health', 'counseling', 'wellness', 'healthcare'],
  'Beginner',
  ARRAY['WordPress', 'Website Builder'],
  'Responsive Design',
  true
),

-- Portfolio Templates
(
  'Creative Portfolio Showcase',
  'creative-portfolio-showcase',
  'A stunning portfolio template for creative professionals. Features project galleries, about page, and contact forms with a focus on visual storytelling.',
  'Creative portfolio template for artists and designers',
  27.99, 37.99,
  (SELECT id FROM public.categories WHERE slug = 'portfolio-templates'),
  ARRAY['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800'],
  ARRAY['HTML', 'CSS', 'JS', 'Sketch'],
  'Creative Portfolio Website Template | Artist & Designer | Miracute',
  'Beautiful portfolio template perfect for creative professionals to showcase their work and skills.',
  ARRAY['portfolio', 'creative', 'artist', 'designer', 'gallery'],
  'Beginner',
  ARRAY['Any Website Builder', 'Sketch'],
  'Responsive Design',
  false
),

-- Restaurant Templates
(
  'Artisan Restaurant Website',
  'artisan-restaurant-website',
  'An appetizing restaurant website template featuring menu displays, reservation system, and photo galleries. Perfect for fine dining establishments.',
  'Restaurant website template with menu and reservation system',
  32.99, 42.99,
  (SELECT id FROM public.categories WHERE slug = 'restaurant-templates'),
  ARRAY['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'],
  ARRAY['HTML', 'CSS', 'JS', 'PHP'],
  'Restaurant Website Template | Menu & Reservations | Miracute',
  'Delicious restaurant website template with online menu, reservation system, and photo galleries.',
  ARRAY['restaurant', 'food', 'dining', 'menu', 'reservations'],
  'Intermediate',
  ARRAY['Website Builder', 'PHP'],
  'Responsive Design',
  true
);

-- Sample Admin User (you'll need to update this with actual user ID after registration)
-- INSERT INTO public.users (id, email, full_name, role) VALUES
-- ('00000000-0000-0000-0000-000000000000', 'admin@miracute.com', 'Admin User', 'admin');

-- Add some sample reviews
INSERT INTO public.product_reviews (product_id, user_id, rating, title, comment, is_verified_purchase) VALUES
((SELECT id FROM public.products WHERE slug = 'elegant-rose-wedding-website'), 
 '00000000-0000-0000-0000-000000000000', -- This would be a real user ID
 5, 
 'Perfect for our wedding!', 
 'This template was exactly what we were looking for. Easy to customize and our guests loved it.',
 true),
((SELECT id FROM public.products WHERE slug = 'calm-therapy-practice-website'), 
 '00000000-0000-0000-0000-000000000000', -- This would be a real user ID
 5, 
 'Professional and calming', 
 'Great template for my therapy practice. The design is professional yet welcoming.',
 true);