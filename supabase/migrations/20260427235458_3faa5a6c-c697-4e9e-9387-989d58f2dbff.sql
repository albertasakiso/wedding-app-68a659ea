-- Allow public uploads to the gallery bucket (guest photo uploads)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Anyone can upload to gallery bucket'
  ) THEN
    CREATE POLICY "Anyone can upload to gallery bucket"
      ON storage.objects
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (bucket_id = 'gallery');
  END IF;
END$$;