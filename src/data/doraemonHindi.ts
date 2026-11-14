export interface DoraemonEpisode {
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
    { season_number: 1, name: 'Season 1 (Hindi)', episode_count: 37 }
  ],
  episodes: [
  {
    "season": 1,
    "episode": 1,
    "title": "Doraemon Hindi - Season 1 Episode 1",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in]%20Doraemon%20Hindi%20S01E01.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 2,
    "title": "Doraemon Hindi - Season 1 Episode 2",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E02.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 3,
    "title": "Doraemon Hindi - Season 1 Episode 3",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E03.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 4,
    "title": "Doraemon Hindi - Season 1 Episode 4",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E04.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 5,
    "title": "Doraemon Hindi - Season 1 Episode 5",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E05.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 6,
    "title": "Doraemon Hindi - Season 1 Episode 6",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E06.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 7,
    "title": "Doraemon Hindi - Season 1 Episode 7",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E07.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 8,
    "title": "Doraemon Hindi - Season 1 Episode 8",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E08.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 9,
    "title": "Doraemon Hindi - Season 1 Episode 9",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E09.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 10,
    "title": "Doraemon Hindi - Season 1 Episode 10",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E10.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 11,
    "title": "Doraemon Hindi - Season 1 Episode 11",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E11.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 12,
    "title": "Doraemon Hindi - Season 1 Episode 12",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E12.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 13,
    "title": "Doraemon Hindi - Season 1 Episode 13",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E13.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 14,
    "title": "Doraemon Hindi - Season 1 Episode 14",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E14.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 15,
    "title": "Doraemon Hindi - Season 1 Episode 15",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E15.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 16,
    "title": "Doraemon Hindi - Season 1 Episode 16",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E16.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 17,
    "title": "Doraemon Hindi - Season 1 Episode 17",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E17.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 18,
    "title": "Doraemon Hindi - Season 1 Episode 18",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E18.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 19,
    "title": "Doraemon Hindi - Season 1 Episode 19",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E19.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 20,
    "title": "Doraemon Hindi - Season 1 Episode 20",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E20.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 21,
    "title": "Doraemon Hindi - Season 1 Episode 21",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E21.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 22,
    "title": "Doraemon Hindi - Season 1 Episode 22",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E22.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 23,
    "title": "Doraemon Hindi - Season 1 Episode 23",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E23.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 24,
    "title": "Doraemon Hindi - Season 1 Episode 24",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E24.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 25,
    "title": "Doraemon Hindi - Season 1 Episode 25",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E25.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 26,
    "title": "Doraemon Hindi - Season 1 Episode 26",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E26.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 27,
    "title": "Doraemon Hindi - Season 1 Episode 27",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E27.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 28,
    "title": "Doraemon Hindi - Season 1 Episode 28",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E28.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 29,
    "title": "Doraemon Hindi - Season 1 Episode 29",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E29.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 31,
    "title": "Doraemon Hindi - Season 1 Episode 31",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E31.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 32,
    "title": "Doraemon Hindi - Season 1 Episode 32",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E32.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 33,
    "title": "Doraemon Hindi - Season 1 Episode 33",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E33.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 34,
    "title": "Doraemon Hindi - Season 1 Episode 34",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E34.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 35,
    "title": "Doraemon Hindi - Season 1 Episode 35",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E35.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 36,
    "title": "Doraemon Hindi - Season 1 Episode 36",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E36.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 37,
    "title": "Doraemon Hindi - Season 1 Episode 37",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E37.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  },
  {
    "season": 1,
    "episode": 38,
    "title": "Doraemon Hindi - Season 1 Episode 38",
    "streamUrl": "https://dn720306.ca.archive.org/0/items/anime-flix.in-doraemon-hindi-s-01-e-08/[AnimeFlix.in] Doraemon Hindi S01E38.mkv",
    "poster": "https://i.postimg.cc/pXQbSKST/doraemon-season-one.jpg"
  }
]
};

export const DORAEMON_HINDI_MOVIES: DoraemonMovie[] = [
  {
    "id": "doraemon_movie_1",
    "title": "Stand by Me Doraemon 1 (2014) (Hindi)",
    "name": "Stand by Me Doraemon 1 (2014) (Hindi)",
    "overview": "Watch Stand by Me Doraemon 1 (2014) in Hindi dub on MovieNest.",
    "poster_path": "https://upload.wikimedia.org/wikipedia/en/0/01/Stand_by_Me_Doraemon_official_poster.jpg",
    "media_type": "movie",
    "vote_average": 8.8,
    "streamUrl": "https://box-1091-w.vmeas.cloud/hls/xqx2p5knjzokjiqbth5snoy4wylflqbvp4ztnqxz7n5z36prmn3fknbbydoa/index-v1-a1.m3u8"
  },
  {
    "id": "doraemon_movie_2",
    "title": "Stand by Me Doraemon 2 (2020) (Hindi)",
    "name": "Stand by Me Doraemon 2 (2020) (Hindi)",
    "overview": "Watch Stand by Me Doraemon 2 (2020) in Hindi dub on MovieNest.",
    "poster_path": "https://upload.wikimedia.org/wikipedia/en/3/3c/Stand_by_Me_Doraemon_2.jpg",
    "media_type": "movie",
    "vote_average": 8.8,
    "streamUrl": "https://ia601605.us.archive.org/33/items/doraemon-stand-by-me-2-480p/Doraemon_Stand_By_Me_2_480p.mp4"
  }
];
