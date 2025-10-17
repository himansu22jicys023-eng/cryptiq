-- Create user_stats table to track user progress
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  quizzes_completed INTEGER NOT NULL DEFAULT 0,
  labs_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "User stats are viewable by everyone" 
ON public.user_stats 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own stats" 
ON public.user_stats 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" 
ON public.user_stats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_stats_updated_at
BEFORE UPDATE ON public.user_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to initialize user stats
CREATE OR REPLACE FUNCTION public.initialize_user_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to automatically create stats when user signs up
CREATE TRIGGER on_user_stats_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_stats();

-- Create lab_completions table
CREATE TABLE IF NOT EXISTS public.lab_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_id INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lab_id)
);

-- Enable RLS
ALTER TABLE public.lab_completions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own lab completions"
ON public.lab_completions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lab completions"
ON public.lab_completions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_user_stats_xp ON public.user_stats(total_xp DESC);
CREATE INDEX idx_lab_completions_user_id ON public.lab_completions(user_id);

-- Function to update user stats when quiz is completed
CREATE OR REPLACE FUNCTION update_user_stats_on_quiz()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_stats
  SET 
    total_xp = total_xp + COALESCE(NEW.jiet_amount, 0) * 10, -- Convert JIET to XP
    quizzes_completed = (
      SELECT COUNT(DISTINCT quiz_id) 
      FROM public.quiz_completions 
      WHERE user_id = NEW.user_id
    ),
    last_activity_date = CURRENT_DATE,
    current_streak = CASE
      WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak + 1
      WHEN last_activity_date = CURRENT_DATE THEN current_streak
      ELSE 1
    END,
    longest_streak = GREATEST(
      longest_streak,
      CASE
        WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak + 1
        WHEN last_activity_date = CURRENT_DATE THEN current_streak
        ELSE 1
      END
    ),
    updated_at = now()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats on quiz completion
CREATE TRIGGER on_quiz_completed
  AFTER INSERT OR UPDATE ON public.quiz_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_on_quiz();

-- Function to update user stats when lab is completed
CREATE OR REPLACE FUNCTION update_user_stats_on_lab()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_stats
  SET 
    total_xp = total_xp + 150, -- Lab completion XP
    labs_completed = (
      SELECT COUNT(DISTINCT lab_id) 
      FROM public.lab_completions 
      WHERE user_id = NEW.user_id
    ),
    last_activity_date = CURRENT_DATE,
    current_streak = CASE
      WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak + 1
      WHEN last_activity_date = CURRENT_DATE THEN current_streak
      ELSE 1
    END,
    longest_streak = GREATEST(
      longest_streak,
      CASE
        WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak + 1
        WHEN last_activity_date = CURRENT_DATE THEN current_streak
        ELSE 1
      END
    ),
    updated_at = now()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats on lab completion
CREATE TRIGGER on_lab_completed
  AFTER INSERT ON public.lab_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_on_lab();

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);