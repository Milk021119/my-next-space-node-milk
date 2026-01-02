import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 这就是你在全栈开发中唯一的“联络员”
export const supabase = createClient(supabaseUrl, supabaseAnonKey)