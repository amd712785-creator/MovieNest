import { LiveTvChannel } from '../types';

let directChannelsCache: LiveTvChannel[] | null = null;
let directCategoriesCache: string[] = [];
let directCountriesCache: { code: string; name: string; flag?: string }[] = [];
let cacheTime = 0;
const CACHE_TTL = 20 * 60 * 1000; // 20 mins

export async function loadDirectIptvData(): Promise<LiveTvChannel[]> {
  const now = Date.now();
  if (directChannelsCache && now - cacheTime < CACHE_TTL) {
    return directChannelsCache;
  }

  try {
    const [channelsRes, streamsRes, logosRes, countriesRes] = await Promise.all([
      fetch('https://iptv-org.github.io/api/channels.json').then((r) => (r.ok ? r.json() : [])),
      fetch('https://iptv-org.github.io/api/streams.json').then((r) => (r.ok ? r.json() : [])),
      fetch('https://iptv-org.github.io/api/logos.json').then((r) => (r.ok ? r.json() : [])),
      fetch('https://iptv-org.github.io/api/countries.json').then((r) => (r.ok ? r.json() : [])),
    ]);

    const logoMap = new Map<string, string>();
    for (const l of logosRes) {
      if (l.channel && l.url && (!logoMap.has(l.channel) || l.in_use)) {
        logoMap.set(l.channel, l.url);
      }
    }

    const streamMap = new Map<string, { url: string; quality?: string | null }>();
    for (const s of streamsRes) {
      if (s.channel && s.url && s.url.startsWith('http') && !streamMap.has(s.channel)) {
        streamMap.set(s.channel, { url: s.url, quality: s.quality || null });
      }
    }

    const countryMap = new Map<string, { name: string; code: string; flag?: string }>();
    for (const c of countriesRes) {
      countryMap.set(c.code, { name: c.name, code: c.code, flag: c.flag || '' });
    }

    const curated: LiveTvChannel[] = [
      {
        id: 'NASATVMedia.us',
        name: 'NASA TV HD',
        country: 'US',
        countryName: 'United States',
        countryFlag: '🇺🇸',
        category: 'science',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg',
        streamUrl: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
        quality: '1080p',
      },
      {
        id: 'DWEnglish.de',
        name: 'DW News (English)',
        country: 'DE',
        countryName: 'Germany',
        countryFlag: '🇩🇪',
        category: 'news',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Deutsche_Welle_symbol_2012.svg',
        streamUrl: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8',
        quality: '720p',
      },
    ];

    const compiled: LiveTvChannel[] = [];
    const catSet = new Set<string>();
    const countryListMap = new Map<string, { code: string; name: string; flag?: string }>();

    for (const cur of curated) {
      compiled.push(cur);
      catSet.add(cur.category);
      countryListMap.set(cur.country, { code: cur.country, name: cur.countryName || cur.country, flag: cur.countryFlag });
    }

    for (const c of channelsRes) {
      const stream = streamMap.get(c.id);
      if (stream && c.name && !c.is_nsfw) {
        const cat = (c.categories && c.categories[0]) || 'general';
        catSet.add(cat);

        const countryInfo = countryMap.get(c.country);
        const countryName = countryInfo ? countryInfo.name : c.country || 'Global';
        const countryFlag = countryInfo?.flag || '';

        if (c.country) {
          countryListMap.set(c.country, {
            code: c.country,
            name: countryName,
            flag: countryFlag,
          });
        }

        compiled.push({
          id: c.id,
          name: c.name,
          country: c.country || 'Global',
          countryName,
          countryFlag,
          category: cat,
          logo: logoMap.get(c.id) || '',
          streamUrl: stream.url,
          quality: stream.quality,
        });
      }
    }

    directChannelsCache = compiled;
    directCategoriesCache = Array.from(catSet).sort();
    directCountriesCache = Array.from(countryListMap.values()).sort((a, b) => {
      if (a.code === 'BD') return -1;
      if (b.code === 'BD') return 1;
      return a.name.localeCompare(b.name);
    });

    cacheTime = now;
    return compiled;
  } catch (err) {
    console.error('Failed to load direct IPTV-org data:', err);
    if (directChannelsCache) return directChannelsCache;
    return [];
  }
}

export async function fetchDirectIptvChannels(params: {
  category?: string;
  country?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const channels = await loadDirectIptvData();
  let filtered = channels;

  if (params.country && params.country !== 'all') {
    const targetCountry = params.country.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.country.toLowerCase() === targetCountry ||
        (c.countryName && c.countryName.toLowerCase() === targetCountry)
    );
  }

  if (params.category && params.category !== 'all') {
    const targetCat = params.category.toLowerCase();
    filtered = filtered.filter((c) => c.category.toLowerCase() === targetCat);
  }

  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    filtered = filtered.filter((c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
  }

  const page = params.page || 1;
  const limit = params.limit || 24;
  const totalResults = filtered.length;
  const totalPages = Math.ceil(totalResults / limit) || 1;
  const start = (page - 1) * limit;
  const results = filtered.slice(start, start + limit);

  return {
    page,
    totalPages,
    totalResults,
    results,
    categories: directCategoriesCache,
    countries: directCountriesCache,
  };
}
