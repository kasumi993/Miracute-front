-- Fix analytics_events table structure
-- This migration ensures the analytics_events table has all required columns

-- Drop existing table if it exists to recreate with proper structure
DROP TABLE IF EXISTS public.analytics_events;

-- Create analytics_events table with all required columns
CREATE TABLE public.analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    url TEXT,
    page_path TEXT,
    page_title TEXT,
    referrer TEXT,
    user_agent TEXT,
    session_id VARCHAR(255),
    visitor_id VARCHAR(255),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    product_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for better performance
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_events_url ON public.analytics_events(url);
CREATE INDEX idx_analytics_events_session_id ON public.analytics_events(session_id);
CREATE INDEX idx_analytics_events_visitor_id ON public.analytics_events(visitor_id);
CREATE INDEX idx_analytics_events_product_id ON public.analytics_events(product_id);
CREATE INDEX idx_analytics_events_page_path ON public.analytics_events(page_path);

-- Enable Row Level Security
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Service role can insert analytics events" ON public.analytics_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can select analytics events" ON public.analytics_events
    FOR SELECT USING (true);

CREATE POLICY "Service role can update analytics events" ON public.analytics_events
    FOR UPDATE USING (true);

CREATE POLICY "Service role can delete analytics events" ON public.analytics_events
    FOR DELETE USING (true);

-- Grant permissions to service role
GRANT ALL ON public.analytics_events TO service_role;
GRANT ALL ON public.analytics_events TO postgres;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_analytics_events_updated_at
    BEFORE UPDATE ON public.analytics_events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();