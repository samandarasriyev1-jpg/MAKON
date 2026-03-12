-- Phase 1 Migration: Schema Consistency & Wallet Fixes
-- Run this in Supabase SQL Editor

-- 1. Add wallet_balance to profiles (centralize user balance)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'wallet_balance') THEN
        ALTER TABLE public.profiles ADD COLUMN wallet_balance integer DEFAULT 0;
    END IF;
END $$;

-- 2. Migrate existing balance from 'users' table if it exists (hypothetical, based on code analysis)
-- Since 'users' table is not in schema.sql, we assume it might have been created manually or code was referring to a non-existent table.
-- We will ensure 'profiles' is the source of truth.

-- 3. Enhance Lessons Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'duration') THEN
        ALTER TABLE public.lessons ADD COLUMN duration integer DEFAULT 0; -- in seconds
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'is_free') THEN
        ALTER TABLE public.lessons ADD COLUMN is_free boolean DEFAULT false;
    END IF;
END $$;

-- 4. Create RPC for secure wallet operations (Credit/Debit)
-- This prevents race conditions and ensures transaction integrity
CREATE OR REPLACE FUNCTION public.process_wallet_transaction(
    p_user_id uuid,
    p_amount integer,
    p_type text, -- 'credit' or 'debit'
    p_description text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_balance integer;
    v_new_balance integer;
    v_transaction_id uuid;
BEGIN
    -- Lock the profile row for update to prevent race conditions
    SELECT wallet_balance INTO v_current_balance FROM public.profiles WHERE id = p_user_id FOR UPDATE;
    
    IF v_current_balance IS NULL THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;

    -- Calculate new balance
    IF p_type = 'credit' THEN
        v_new_balance := v_current_balance + p_amount;
    ELSIF p_type = 'debit' THEN
        IF v_current_balance < p_amount THEN
            RAISE EXCEPTION 'Insufficient funds';
        END IF;
        v_new_balance := v_current_balance - p_amount;
    ELSE
        RAISE EXCEPTION 'Invalid transaction type';
    END IF;

    -- Update balance
    UPDATE public.profiles SET wallet_balance = v_new_balance WHERE id = p_user_id;

    -- Record transaction
    INSERT INTO public.transactions (user_id, amount, type, description, status)
    VALUES (p_user_id, p_amount, p_type, p_description, 'completed')
    RETURNING id INTO v_transaction_id;

    RETURN json_build_object(
        'success', true,
        'new_balance', v_new_balance,
        'transaction_id', v_transaction_id
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;

-- 5. Fix Community Likes (RPC for atomic increment/decrement)
CREATE OR REPLACE FUNCTION public.toggle_post_like(p_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_exists boolean;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT EXISTS(SELECT 1 FROM public.post_likes WHERE post_id = p_post_id AND user_id = v_user_id) INTO v_exists;

    IF v_exists THEN
        DELETE FROM public.post_likes WHERE post_id = p_post_id AND user_id = v_user_id;
        UPDATE public.community_posts SET likes_count = likes_count - 1 WHERE id = p_post_id;
    ELSE
        INSERT INTO public.post_likes (post_id, user_id) VALUES (p_post_id, v_user_id);
        UPDATE public.community_posts SET likes_count = likes_count + 1 WHERE id = p_post_id;
    END IF;
END;
$$;

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_lesson ON public.user_progress(user_id, lesson_id);
