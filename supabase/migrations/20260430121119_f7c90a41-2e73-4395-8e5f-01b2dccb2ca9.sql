-- Seed default wedding day timeline events (only if events table is empty)
INSERT INTO public.events (title, description, event_time, location, order_index, icon, highlight_color)
SELECT * FROM (VALUES
  ('Ceremony', 'Exchange of vows in the garden pavilion.', '2026-05-02 15:00:00+00'::timestamptz, 'Rose Garden Pavilion', 0, 'Church', '#D4AF37'),
  ('Cocktail Hour', 'Enjoy signature cocktails and hors d''oeuvres.', '2026-05-02 16:00:00+00'::timestamptz, 'Terrace Lounge', 1, 'Martini', '#D4AF37'),
  ('Reception & Dinner', 'Celebrate with a gourmet dinner and toasts.', '2026-05-02 17:30:00+00'::timestamptz, 'Grand Ballroom', 2, 'UtensilsCrossed', '#D4AF37'),
  ('Dancing & Celebration', 'Dance the night away under the stars.', '2026-05-02 20:00:00+00'::timestamptz, 'Grand Ballroom', 3, 'Music', '#D4AF37')
) AS v(title, description, event_time, location, order_index, icon, highlight_color)
WHERE NOT EXISTS (SELECT 1 FROM public.events);