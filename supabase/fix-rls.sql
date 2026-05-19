-- Fix RLS policies for profiles table
-- Drop existing policies
DROP POLICY IF EXISTS "Profiles readable by authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Profiles updatable by owner" ON public.profiles;

-- Recreate with correct policies
CREATE POLICY "Profiles readable by authenticated" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Profiles updatable by owner" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Also fix thrust areas policy
DROP POLICY IF EXISTS "Thrust areas readable" ON public.thrust_areas;
CREATE POLICY "Thrust areas readable" ON public.thrust_areas
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix goal cycles policy
DROP POLICY IF EXISTS "Cycles readable" ON public.goal_cycles;
CREATE POLICY "Cycles readable" ON public.goal_cycles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix goal approvals policy
DROP POLICY IF EXISTS "Approvals readable" ON public.goal_approvals;
CREATE POLICY "Approvals readable" ON public.goal_approvals
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix audit logs policy
DROP POLICY IF EXISTS "Audit logs readable" ON public.audit_logs;
CREATE POLICY "Audit logs readable" ON public.audit_logs
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Audit logs insertable by authenticated" ON public.audit_logs;
CREATE POLICY "Audit logs insertable by authenticated" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
