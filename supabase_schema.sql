-- ==============================================================================
-- LaPAM -80°C Freezer Management System: Database Schema (Supabase / PostgreSQL)
-- ==============================================================================
-- Execute este script no SQL Editor do seu projeto Supabase para criar as tabelas
-- e habilitar a sincronização em tempo real (Realtime).
-- ==============================================================================

-- 1. Tabela de Gavetas (freezer_drawers)
CREATE TABLE IF NOT EXISTS public.freezer_drawers (
    id INT PRIMARY KEY,
    number INT NOT NULL,
    name_pt TEXT NOT NULL,
    name_en TEXT,
    claimed_by TEXT DEFAULT 'coletivo',
    claimed_by_name TEXT DEFAULT 'Coletivo / LaPAM',
    is_community BOOLEAN DEFAULT true,
    description_pt TEXT,
    description_en TEXT,
    color TEXT DEFAULT '#0284c7',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Caixas e Amostras (freezer_boxes)
CREATE TABLE IF NOT EXISTS public.freezer_boxes (
    id TEXT PRIMARY KEY,
    spot_id TEXT UNIQUE NOT NULL,
    drawer INT NOT NULL,
    row INT NOT NULL,
    col INT NOT NULL,
    title TEXT NOT NULL,
    owner_id TEXT DEFAULT 'coletivo',
    owner_name TEXT DEFAULT 'Coletivo / LaPAM',
    category TEXT DEFAULT 'stocks',
    biosafety TEXT DEFAULT 'nb3',
    date TEXT,
    expiry_date TEXT,
    grid_type TEXT DEFAULT '9x9',
    total_capacity INT DEFAULT 81,
    occupied_count INT DEFAULT 0,
    status TEXT DEFAULT 'active',
    temperature TEXT DEFAULT '-80°C',
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Membros do Laboratório (lab_members)
CREATE TABLE IF NOT EXISTS public.lab_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    color TEXT DEFAULT '#0284c7',
    initials TEXT,
    avatar TEXT DEFAULT './img/LOGO%20LAPAM.png',
    role TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.freezer_drawers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freezer_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_members ENABLE ROW LEVEL SECURITY;

-- 5. Criar Políticas de Acesso Público (Leitura e Escrita anônima para o laboratório)
DROP POLICY IF EXISTS "Allow public full access to drawers" ON public.freezer_drawers;
CREATE POLICY "Allow public full access to drawers"
ON public.freezer_drawers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access to boxes" ON public.freezer_boxes;
CREATE POLICY "Allow public full access to boxes"
ON public.freezer_boxes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access to lab_members" ON public.lab_members;
CREATE POLICY "Allow public full access to lab_members"
ON public.lab_members FOR ALL USING (true) WITH CHECK (true);

-- 6. Habilitar Replicação em Tempo Real (Supabase Realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE public.freezer_drawers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.freezer_boxes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_members;

-- ==============================================================================
-- Pronto! As tabelas e os WebSockets de tempo real já estão ativos.
-- ==============================================================================
