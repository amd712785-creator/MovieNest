const fs = require('fs');

const content = fs.readFileSync('/tmp/doraemon-repo/doraemon-hindi.m3u', 'utf8');
const lines = content.split('\n');
const items = [];
let current = null;

for (let line of lines) {
  line = line.trim();
  if (line.startsWith('#EXTINF:')) {
    const logoMatch = line.match(/tvg-logo="([^"]+)"/);
    const groupMatch = line.match(/group-title="([^"]+)"/);
    const titleMatch = line.match(/,\s*(.+)$/);
    current = {
      logo: logoMatch ? logoMatch[1] : '',
      group: groupMatch ? groupMatch[1] : 'Season-1',
      title: titleMatch ? titleMatch[1] : '',
      url: ''
    };
  } else if (line.startsWith('http') && current) {
    current.url = line;
    items.push(current);
    current = null;
  }
}

const season1Episodes = items.filter(it => it.group === 'Season-1').map((it, idx) => {
  const epNum = parseInt(it.title.replace(/\D/g, ''), 10) || (idx + 1);
  return {
    season: 1,
    episode: epNum,
    title: `Doraemon Hindi - Season 1 Episode ${epNum}`,
    streamUrl: it.url,
    poster: it.logo || 'https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg'
  };
});

const doraemonMovies = items.filter(it => it.group === 'Movies').map((it, idx) => {
  return {
    id: `doraemon_movie_${idx + 1}`,
    title: `${it.title} (Hindi)`,
    name: `${it.title} (Hindi)`,
    overview: `Watch ${it.title} in Hindi dub on MovieNest.`,
    poster_path: it.logo,
    media_type: 'movie',
    vote_average: 8.8,
    streamUrl: it.url
  };
});

const tsCode = `export interface DoraemonEpisode {
  season: number;
  episode: number;
  title: string;
  streamUrl: string;
  poster: string;
}

export interface DoraemonMovie {
  id: string;
  title: string;
  name: string;
  overview: string;
  poster_path: string;
  media_type: 'movie';
  vote_average: number;
  streamUrl: string;
}

export const DORAEMON_HINDI_SHOW = {
  id: 33895,
  title: 'Doraemon (Hindi)',
  name: 'Doraemon (Hindi)',
  overview: 'Doraemon is a cat-like robot from the 22nd century sent to help young Nobita Nobi. With incredible gadgets from his 4D pocket, Doraemon helps Nobita face daily challenges. Watch Doraemon Season 1 in Hindi dub!',
  poster_path: 'https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg',
  backdrop_path: 'https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg',
  media_type: 'tv' as const,
  vote_average: 9.2,
  release_date: '2005-04-15',
  first_air_date: '2005-04-15',
  language: 'Hindi',
  seasons: [
    { season_number: 1, name: 'Season 1 (Hindi)', episode_count: ${season1Episodes.length} }
  ],
  episodes: ${JSON.stringify(season1Episodes, null, 2)}
};

export const DORAEMON_HINDI_MOVIES: DoraemonMovie[] = ${JSON.stringify(doraemonMovies, null, 2)};
`;

fs.writeFileSync('src/data/doraemonHindi.ts', tsCode, 'utf8');
console.log('Successfully created src/data/doraemonHindi.ts');
