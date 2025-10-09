-- Create quiz_completions table to track quiz completion and rewards
CREATE TABLE IF NOT EXISTS public.quiz_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id INTEGER NOT NULL,
  score INTEGER NOT NULL,
  jiet_rewarded BOOLEAN DEFAULT FALSE,
  jiet_amount DECIMAL(18, 6) DEFAULT 0,
  wallet_address TEXT,
  transaction_signature TEXT,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, quiz_id)
);

-- Enable Row Level Security
ALTER TABLE public.quiz_completions ENABLE ROW LEVEL SECURITY;

-- Users can view their own completions
CREATE POLICY "Users can view their own quiz completions"
ON public.quiz_completions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own completions
CREATE POLICY "Users can insert their own quiz completions"
ON public.quiz_completions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own completions
CREATE POLICY "Users can update their own quiz completions"
ON public.quiz_completions
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_quiz_completions_user_id ON public.quiz_completions(user_id);
CREATE INDEX idx_quiz_completions_quiz_id ON public.quiz_completions(quiz_id);