-- Create bird identifications table to store user's bird sightings
CREATE TABLE IF NOT EXISTS public.bird_identifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  bird_name TEXT NOT NULL,
  confidence FLOAT,
  identification_type TEXT NOT NULL CHECK (identification_type IN ('audio', 'image')),
  additional_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_bird_identifications_created_at ON public.bird_identifications(created_at DESC);
CREATE INDEX idx_bird_identifications_user_id ON public.bird_identifications(user_id);

-- Enable Row Level Security
ALTER TABLE public.bird_identifications ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Anyone can view bird identifications"
  ON public.bird_identifications
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create bird identifications"
  ON public.bird_identifications
  FOR INSERT
  WITH CHECK (true);