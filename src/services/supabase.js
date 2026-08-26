import { createClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'lapam_supabase_url';
const STORAGE_KEY_KEY = 'lapam_supabase_anon_key';

let supabaseInstance = null;

// Get active credentials from env or localStorage
export function getSupabaseCredentials() {
  let url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  let key = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  
  if (!url && typeof localStorage !== 'undefined') {
    url = (localStorage.getItem(STORAGE_URL_KEY) || '').trim();
  }
  if (!key && typeof localStorage !== 'undefined') {
    key = (localStorage.getItem(STORAGE_KEY_KEY) || '').trim();
  }
  return { url, key };
}

export function isSupabaseConfigured() {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key && url.startsWith('http'));
}

export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;

  const { url, key } = getSupabaseCredentials();
  if (url && key && url.startsWith('http')) {
    supabaseInstance = createClient(url, key);
    return supabaseInstance;
  }
  return null;
}

export function saveSupabaseCredentials(url, key) {
  if (url && key) {
    localStorage.setItem(STORAGE_URL_KEY, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, key.trim());
    supabaseInstance = createClient(url.trim(), key.trim());
  } else {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_KEY_KEY);
    supabaseInstance = null;
  }
}

// Convert DB row (snake_case) to Box object (camelCase)
export function mapDbToBox(row) {
  return {
    id: row.id,
    spotId: row.spot_id,
    drawer: row.drawer,
    row: row.row,
    col: row.col,
    title: row.title,
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    category: row.category,
    biosafety: row.biosafety,
    date: row.date,
    expiryDate: row.expiry_date,
    gridType: row.grid_type,
    totalCapacity: row.total_capacity,
    occupiedCount: row.occupied_count,
    status: row.status,
    temperature: row.temperature,
    description: row.description,
    tags: Array.isArray(row.tags) ? row.tags : (row.tags ? [row.tags] : []),
    notes: row.notes,
  };
}

// Convert Box object (camelCase) to DB row (snake_case)
export function mapBoxToDb(box) {
  return {
    id: box.id,
    spot_id: box.spotId,
    drawer: box.drawer,
    row: box.row,
    col: box.col,
    title: box.title,
    owner_id: box.ownerId,
    owner_name: box.ownerName,
    category: box.category,
    biosafety: box.biosafety,
    date: box.date,
    expiry_date: box.expiryDate || '',
    grid_type: box.gridType || '9x9',
    total_capacity: box.totalCapacity || 81,
    occupied_count: box.occupiedCount || 0,
    status: box.status || 'active',
    temperature: box.temperature || '-80°C',
    description: box.description || '',
    tags: Array.isArray(box.tags) ? box.tags : [],
    notes: box.notes || '',
    updated_at: new Date().toISOString(),
  };
}

// Convert DB row to Drawer object
export function mapDbToDrawer(row) {
  return {
    id: row.id,
    number: row.number,
    namePt: row.name_pt,
    nameEn: row.name_en || row.name_pt,
    claimedBy: row.claimed_by,
    claimedByName: row.claimed_by_name,
    isCommunity: row.is_community,
    descriptionPt: row.description_pt || '',
    descriptionEn: row.description_en || '',
    color: row.color || '#0284c7',
  };
}

// Convert Drawer object to DB row
export function mapDrawerToDb(drawer) {
  return {
    id: drawer.id,
    number: drawer.number,
    name_pt: drawer.namePt,
    name_en: drawer.nameEn || drawer.namePt,
    claimed_by: drawer.claimedBy || 'coletivo',
    claimed_by_name: drawer.claimedByName || 'Coletivo / LaPAM',
    is_community: drawer.isCommunity ?? true,
    description_pt: drawer.descriptionPt || '',
    description_en: drawer.descriptionEn || '',
    color: drawer.color || '#0284c7',
    updated_at: new Date().toISOString(),
  };
}

// Remote API methods
export async function fetchRemoteFreezerData() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const [drawersRes, boxesRes] = await Promise.all([
      supabase.from('freezer_drawers').select('*').order('number', { ascending: true }),
      supabase.from('freezer_boxes').select('*')
    ]);

    if (drawersRes.error) throw drawersRes.error;
    if (boxesRes.error) throw boxesRes.error;

    // Filter out system metadata from regular boxes
    const regularBoxes = (boxesRes.data || [])
      .filter(row => row.id !== '__app_members_metadata__' && row.drawer > 0)
      .map(mapDbToBox);

    return {
      drawers: drawersRes.data.map(mapDbToDrawer),
      boxes: regularBoxes,
    };
  } catch (err) {
    console.error('Error fetching remote data from Supabase:', err);
    throw err;
  }
}

export async function saveRemoteBox(box) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const dbPayload = mapBoxToDb(box);
  const { error } = await supabase.from('freezer_boxes').upsert(dbPayload, { onConflict: 'id' });
  if (error) {
    console.error('Error saving box to Supabase:', error);
    throw error;
  }
}

export async function deleteRemoteBox(boxId) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase.from('freezer_boxes').delete().eq('id', boxId);
  if (error) {
    console.error('Error deleting box from Supabase:', error);
    throw error;
  }
}

export async function saveRemoteDrawer(drawer) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const dbPayload = mapDrawerToDb(drawer);
  const { error } = await supabase.from('freezer_drawers').upsert(dbPayload, { onConflict: 'id' });
  if (error) {
    console.error('Error saving drawer to Supabase:', error);
    throw error;
  }
}

export async function batchSeedRemoteData(drawers, boxes) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const drawersDb = drawers.map(mapDrawerToDb);
  const boxesDb = boxes.map(mapBoxToDb);

  const [dRes, bRes] = await Promise.all([
    supabase.from('freezer_drawers').upsert(drawersDb, { onConflict: 'id' }),
    supabase.from('freezer_boxes').upsert(boxesDb, { onConflict: 'id' })
  ]);

  if (dRes.error) throw dRes.error;
  if (bRes.error) throw bRes.error;
}

// Convert DB row to Member object
export function mapDbToMember(row) {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en || row.name,
    color: row.color || '#0284c7',
    initials: row.initials || (row.name ? row.name.slice(0, 2).toUpperCase() : 'MB'),
    avatar: row.avatar || './img/LOGO%20LAPAM.png',
    role: row.role || '',
    active: row.active ?? true,
  };
}

// Convert Member object to DB row
export function mapMemberToDb(member) {
  return {
    id: member.id,
    name: member.name,
    name_en: member.nameEn || member.name,
    color: member.color || '#0284c7',
    initials: member.initials || (member.name ? member.name.slice(0, 2).toUpperCase() : 'MB'),
    avatar: member.avatar || './img/LOGO%20LAPAM.png',
    role: member.role || '',
    active: member.active ?? true,
    updated_at: new Date().toISOString(),
  };
}

export async function fetchRemoteMembers() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  // 1. Try dedicated lab_members table if created
  try {
    const { data, error } = await supabase
      .from('lab_members')
      .select('*')
      .order('name', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map(mapDbToMember);
    }
  } catch (err) {
    // Graceful fallback to metadata record
  }

  // 2. Read from system metadata record in freezer_boxes (zero setup required)
  try {
    const { data, error } = await supabase
      .from('freezer_boxes')
      .select('description')
      .eq('id', '__app_members_metadata__')
      .maybeSingle();

    if (!error && data && data.description) {
      const parsed = JSON.parse(data.description);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read members from Supabase metadata:', err);
  }

  return null;
}

export async function saveRemoteMembersList(members) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  // 1. Always store to system metadata record in freezer_boxes (100% automatic)
  try {
    const payload = {
      id: '__app_members_metadata__',
      spot_id: '__SYSTEM_MEMBERS__',
      drawer: 0,
      row: 0,
      col: 0,
      title: '__SYSTEM_MEMBERS__',
      owner_id: 'coletivo',
      owner_name: 'Coletivo / LaPAM',
      category: 'stocks',
      biosafety: 'nb3',
      description: JSON.stringify(members),
      status: 'system',
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('freezer_boxes').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn('Error saving members metadata to freezer_boxes:', error);
    }
  } catch (err) {
    console.warn('Could not sync members metadata to Supabase:', err);
  }

  // 2. Also try lab_members table if it exists in Supabase
  try {
    const membersDb = members.map(mapMemberToDb);
    await supabase.from('lab_members').upsert(membersDb, { onConflict: 'id' });
  } catch (err) {
    // Ignored if table does not exist
  }
}

export async function saveRemoteMember(member) {
  // Legacy / single member save - delegates to full list sync if needed
}

export async function deleteRemoteMember(memberId) {
  // Legacy / single member delete - delegates to full list sync
}

export async function batchSeedRemoteMembers(members) {
  await saveRemoteMembersList(members);
}

export function subscribeToRealtimeChanges(onDataChanged) {
  const supabase = getSupabaseClient();
  if (!supabase) return () => {};

  const channelName = `realtime_freezer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const channel = supabase
    .channel(channelName)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'freezer_boxes' }, () => {
      onDataChanged();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'freezer_drawers' }, () => {
      onDataChanged();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'lab_members' }, () => {
      onDataChanged();
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Supabase Realtime] Connected to channel:', channelName);
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
