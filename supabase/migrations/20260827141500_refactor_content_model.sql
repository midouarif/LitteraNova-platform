-- Drop the chapters table
DROP TABLE IF EXISTS public.chapters CASCADE;

-- Add columns to works
ALTER TABLE public.works
ADD COLUMN file_url text,
ADD COLUMN content_text text;

-- Create 'documents' storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for the documents bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documents' );

CREATE POLICY "Teachers and admins can insert documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role in ('teacher', 'admin')
  )
);

CREATE POLICY "Teachers and admins can update documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents' AND
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role in ('teacher', 'admin')
  )
);

CREATE POLICY "Teachers and admins can delete documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' AND
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role in ('teacher', 'admin')
  )
);
