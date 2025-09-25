-- Add source column to existing topics table
ALTER TABLE public.topics
ADD COLUMN source TEXT DEFAULT 'aula'
CHECK (source IN ('aula', 'livro', 'video', 'outro'));

-- Update any existing topics to have 'aula' as default source
UPDATE public.topics
SET source = 'aula'
WHERE source IS NULL;