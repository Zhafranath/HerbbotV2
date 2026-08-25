-- ============================================================
-- HERBBOT Supabase Schema
-- Jalankan di SQL Editor Supabase
-- ============================================================

-- 1. Tabel robot_state — single row (id=1), status robot saat ini
CREATE TABLE IF NOT EXISTS public.robot_state (
    id            integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    code          text DEFAULT '',
    code_verified boolean DEFAULT false,
    aidose        jsonb DEFAULT '[]'::jsonb,
    progress      text DEFAULT 'robot siap',
    ready         boolean DEFAULT true,
    "order"       text DEFAULT '0',
    created_at    timestamptz DEFAULT now()
);

ALTER TABLE public.robot_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all"
ON public.robot_state
FOR ALL
USING (true)
WITH CHECK (true);

INSERT INTO public.robot_state (id, code, code_verified, aidose, progress, ready, "order")
VALUES (1, '123456', false, '[0,0,0,0,0,0]'::jsonb, 'robot siap', true, '0')
ON CONFLICT (id) DO NOTHING;


-- 2. Tabel orders — history tiap pesanan
CREATE TABLE IF NOT EXISTS public.orders (
    id            bigserial PRIMARY KEY,
    order_number  integer NOT NULL,
    code          text NOT NULL,
    complaint     text,
    aidose        jsonb,
    created_at    timestamptz DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all"
ON public.orders
FOR ALL
USING (true)
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number DESC);
