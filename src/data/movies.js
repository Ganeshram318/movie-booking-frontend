const posterPhotos = ['photo-1440404653325-ab127d49abc1', 'photo-1489599849927-2ee91cede3ba', 'photo-1517604931442-7e0c8ed2963c', 'photo-1485846234645-a62644f84728', 'photo-1478720568477-152d9b164e26'];
const backdropPhotos = ['photo-1489599849927-2ee91cede3ba', 'photo-1517604931442-7e0c8ed2963c', 'photo-1485846234645-a62644f84728'];
const poster = (id) => `https://images.unsplash.com/${posterPhotos[(id - 1) % posterPhotos.length]}?auto=format&fit=crop&w=700&h=980&q=85`;
const backdrop = (id) => `https://images.unsplash.com/${backdropPhotos[(id - 1) % backdropPhotos.length]}?auto=format&fit=crop&w=1900&h=1000&q=85`;

export const movies = [
  { id: 1, title: 'Saiyaara', language: 'Hindi', genre: 'Romance', rating: 4.8, duration: '2h 30m', releaseDate: 'Now showing', poster: poster(1), banner: backdrop(1), blurb: 'An emotional journey of love, music and destiny.', tag: 'THE FEEL-GOOD ROMANCE' },
  { id: 2, title: 'War 2', language: 'Hindi', genre: 'Action', rating: 4.5, duration: '2h 49m', releaseDate: 'Now showing', poster: poster(2), banner: backdrop(2), blurb: 'Two elite agents. One explosive collision.', tag: 'THE ACTION EVENT' },
  { id: 3, title: 'Coolie', language: 'Tamil', genre: 'Action', rating: 4.4, duration: '2h 48m', releaseDate: 'Now showing', poster: poster(3), banner: backdrop(3), blurb: 'A legend returns with a score to settle.', tag: 'A THUNDEROUS RETURN' },
  { id: 4, title: 'The Odyssey', language: 'English', genre: 'Adventure', rating: 4.7, duration: '2h 16m', releaseDate: 'Nov 6, 2026', poster: poster(4), banner: backdrop(1), blurb: 'A legendary journey across an unknown world.', tag: 'A JOURNEY BEYOND' },
  { id: 5, title: 'Maa', language: 'Hindi', genre: 'Horror', rating: 4.1, duration: '2h 13m', releaseDate: 'Now showing', poster: poster(5), banner: backdrop(2), blurb: 'Some promises live beyond the dark.', tag: 'FACE WHAT FOLLOWS' },
  { id: 6, title: 'Final Destination Bloodlines', language: 'English', genre: 'Horror', rating: 4.2, duration: '1h 50m', releaseDate: 'Now showing', poster: poster(6), banner: backdrop(3), blurb: 'Fate has a way of catching up.', tag: 'NO ONE ESCAPES FATE' },
  { id: 7, title: 'Sitaare Zameen Par', language: 'Hindi', genre: 'Drama', rating: 4.6, duration: '2h 35m', releaseDate: 'Now showing', poster: poster(7), banner: backdrop(1), blurb: 'An uplifting story about finding your team.', tag: 'A LITTLE MORE HEART' },
  { id: 8, title: 'How to Train Your Dragon', language: 'English', genre: 'Adventure', rating: 4.7, duration: '2h 5m', releaseDate: 'Now showing', poster: poster(8), banner: backdrop(2), blurb: 'A friendship that changes two worlds.', tag: 'TAKE FLIGHT' },
  { id: 9, title: 'Metro... In Dino', language: 'Hindi', genre: 'Romance', rating: 4.1, duration: '2h 39m', releaseDate: 'Now showing', poster: poster(9), banner: backdrop(3), blurb: 'Stories of love, loss and second chances.', tag: 'LIFE, BETWEEN STATIONS' },
  { id: 10, title: 'Freakier Friday', language: 'English', genre: 'Comedy', rating: 4.0, duration: '1h 51m', releaseDate: 'Nov 13, 2026', poster: poster(10), banner: backdrop(1), blurb: 'A family mix-up, one more time around.', tag: 'THE SWITCH IS BACK' },
  { id: 11, title: 'Thamma', language: 'Hindi', genre: 'Comedy', rating: 4.3, duration: '2h 20m', releaseDate: 'Oct 21, 2026', poster: poster(11), banner: backdrop(2), blurb: 'A delightfully strange new story begins.', tag: 'A MADCAP ADVENTURE' },
  { id: 12, title: 'Kantara: A Legend', language: 'Kannada', genre: 'Thriller', rating: 4.8, duration: '2h 35m', releaseDate: 'Dec 4, 2026', poster: poster(12), banner: backdrop(3), blurb: 'The forest remembers every promise.', tag: 'THE LEGEND CONTINUES' },
];

export const heroMovies = [movies[0], movies[1], movies[2]];
