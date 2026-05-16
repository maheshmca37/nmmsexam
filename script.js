import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

 const supabaseUrl = "https://dbfycihbcosuxxkrmbhl.supabase.co";
 const supabaseKey = "sb_publishable_aOyXtAbzrrX0Z9jPAU1qEA_0ZnK35BX";

 window.supabase =  createClient(supabaseUrl, supabaseKey);
