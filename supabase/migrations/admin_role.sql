-- supabase/migrations/[timestamp]_admin_roles.sql
-- Create admin_roles table to manage admin users

CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Only admins can view admin roles
CREATE POLICY "Admins can view all admin roles"
ON public.admin_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid()
  )
);

-- Only super admins can insert new admins
CREATE POLICY "Super admins can grant admin roles"
ON public.admin_roles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Only super admins can delete admin roles
CREATE POLICY "Super admins can revoke admin roles"
ON public.admin_roles
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Create index for faster lookups
CREATE INDEX idx_admin_roles_user_id ON public.admin_roles(user_id);
CREATE INDEX idx_admin_roles_role ON public.admin_roles(role);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = check_user_id
  );
END;
$$;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = check_user_id AND role = 'super_admin'
  );
END;
$$;

-- Insert default super admin (replace with your email)
-- You should run this manually with your actual user_id after creating your account
-- INSERT INTO public.admin_roles (user_id, role)
-- SELECT id, 'super_admin'
-- FROM auth.users
-- WHERE email = 'admin@cryptiq.com'
-- ON CONFLICT (user_id) DO NOTHING;

-- Create admin_actions table for audit logging
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('create', 'update', 'delete', 'view')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('quiz', 'user', 'reward', 'lab')),
  entity_id TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Admins can view admin actions"
ON public.admin_actions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can insert admin actions"
ON public.admin_actions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid()
  ) AND admin_user_id = auth.uid()
);

-- Create index for admin actions
CREATE INDEX idx_admin_actions_admin_user_id ON public.admin_actions(admin_user_id);
CREATE INDEX idx_admin_actions_entity_type ON public.admin_actions(entity_type);
CREATE INDEX idx_admin_actions_created_at ON public.admin_actions(created_at DESC);

-- Function to log admin action
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action_type TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_action_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'User is not authorized to perform admin actions';
  END IF;

  -- Insert action log
  INSERT INTO public.admin_actions (
    admin_user_id,
    action_type,
    entity_type,
    entity_id,
    details
  ) VALUES (
    auth.uid(),
    p_action_type,
    p_entity_type,
    p_entity_id,
    p_details
  )
  RETURNING id INTO v_action_id;

  RETURN v_action_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_admin_action TO authenticated;