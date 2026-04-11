-- MaxOut Diet Tables

-- Meals Table: Logs individual food items or meal aggregates
CREATE TABLE IF NOT EXISTS public.meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
    name TEXT NOT NULL,
    calories INTEGER NOT NULL DEFAULT 0,
    protein INTEGER NOT NULL DEFAULT 0,
    carbs INTEGER NOT NULL DEFAULT 0,
    fat INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'COMPLETED'
);

-- Water Logs Table: Tracks daily hydration
CREATE TABLE IF NOT EXISTS public.water_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount_ml INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Diet Goals Table: User-specific nutritional targets
CREATE TABLE IF NOT EXISTS public.diet_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    target_calories INTEGER NOT NULL DEFAULT 2000,
    target_protein INTEGER NOT NULL DEFAULT 150,
    target_carbs INTEGER NOT NULL DEFAULT 200,
    target_fat INTEGER NOT NULL DEFAULT 70,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_goals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own meals" ON public.meals
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own water logs" ON public.water_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own diet goals" ON public.diet_goals
    FOR ALL USING (auth.uid() = user_id);

-- Bodyweight Records Table: Historical weight tracking
CREATE TABLE IF NOT EXISTS public.bodyweight_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

ALTER TABLE public.bodyweight_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own weight records" ON public.bodyweight_records
    FOR ALL USING (auth.uid() = user_id);

-- Diet Routines Table: Stores day templates for diet
CREATE TABLE IF NOT EXISTS public.diet_routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    meals JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Diet Programs Table: Stores multi-week schedules
CREATE TABLE IF NOT EXISTS public.diet_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    length_in_days INTEGER NOT NULL DEFAULT 7,
    schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active Diet Program Table: Maps user to currently active schedule
CREATE TABLE IF NOT EXISTS public.active_diet_program (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    program_id UUID REFERENCES public.diet_programs(id) ON DELETE CASCADE,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.diet_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_diet_program ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own diet routines" ON public.diet_routines
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own diet programs" ON public.diet_programs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their active diet program" ON public.active_diet_program
    FOR ALL USING (auth.uid() = user_id);
