const posterPhotos = ['photo-1440404653325-ab127d49abc1', 'photo-1489599849927-2ee91cede3ba', 'photo-1517604931442-7e0c8ed2963c', 'photo-1485846234645-a62644f84728', 'photo-1478720568477-152d9b164e26'];
const backdropPhotos = ['photo-1489599849927-2ee91cede3ba', 'photo-1517604931442-7e0c8ed2963c', 'photo-1485846234645-a62644f84728'];
const poster = (id) => `https://images.unsplash.com/${posterPhotos[(id - 1) % posterPhotos.length]}?auto=format&fit=crop&w=700&h=980&q=85`;
const backdrop = (id) => `https://images.unsplash.com/${backdropPhotos[(id - 1) % backdropPhotos.length]}?auto=format&fit=crop&w=1900&h=1000&q=85`;

export const movies = [
  { id: 1, title: 'Saiyaara', language: 'Hindi', genre: 'Romance', rating: 4.8, duration: '2h 30m', releaseDate: 'Now showing', poster: poster(1), banner: backdrop(1), blurb: 'An emotional journey of love, music and destiny.', tag: 'THE FEEL-GOOD ROMANCE' },
  { id: 2, title: 'War 2', language: 'Hindi', genre: 'Action', rating: 4.5, duration: '2h 49m', releaseDate: 'Now showing', poster: poster(2), banner: backdrop(2), blurb: 'Two elite agents. One explosive collision.', tag: 'THE ACTION EVENT' },
  { id: 3, title: 'Coolie', language: 'Tamil', genre: 'Action', rating: 4.4, duration: '2h 48m', releaseDate: 'Now showing', poster: poster(3), banner: backdrop(3), blurb: 'A legend returns with a score to settle.', tag: 'A THUNDEROUS RETURN' },
  { id: 5, title: 'Maa', language: 'Hindi', genre: 'Horror', rating: 4.1, duration: '2h 13m', releaseDate: 'Now showing', poster: poster(5), banner: backdrop(2), blurb: 'Some promises live beyond the dark.', tag: 'FACE WHAT FOLLOWS' },
  { id: 6, title: 'Final Destination Bloodlines', language: 'English', genre: 'Horror', rating: 4.2, duration: '1h 50m', releaseDate: 'Now showing', poster: poster(6), banner: backdrop(3), blurb: 'Fate has a way of catching up.', tag: 'NO ONE ESCAPES FATE' },
  { id: 7, title: 'Sitaare Zameen Par', language: 'Hindi', genre: 'Drama', rating: 4.6, duration: '2h 35m', releaseDate: 'Now showing', poster: poster(7), banner: backdrop(1), blurb: 'An uplifting story about finding your team.', tag: 'A LITTLE MORE HEART' },
  { id: 8, title: 'How to Train Your Dragon', language: 'English', genre: 'Adventure', rating: 4.7, duration: '2h 5m', releaseDate: 'Now showing', poster: poster(8), banner: backdrop(2), blurb: 'A friendship that changes two worlds.', tag: 'TAKE FLIGHT' },
  { id: 9, title: 'Metro... In Dino', language: 'Hindi', genre: 'Romance', rating: 4.1, duration: '2h 39m', releaseDate: 'Now showing', poster: poster(9), banner: backdrop(3), blurb: 'Stories of love, loss and second chances.', tag: 'LIFE, BETWEEN STATIONS' },
];

export const heroMovies = [movies[0], movies[1], movies[2]];

export const movieDetails = {
  1: { votes: '69.8K+ votes', certification: 'UA 16+', formats: ['2D', 'IMAX 2D', 'Dolby Cinema'], description: 'An emotional journey of love, music and destiny brings two young hearts together, where every song carries a memory and every choice changes the story.', director: 'Mohit Suri', cast: ['Ahaan Panday', 'Aneet Padda', 'Geeta Agarwal'] },
  2: { votes: '52.4K+ votes', certification: 'UA 16+', formats: ['2D', 'IMAX 2D', 'Dolby Cinema'], description: 'Two elite agents find themselves on opposite sides of a high-stakes mission in an action spectacle packed with twists, speed and scale.', director: 'Ayan Mukerji', cast: ['Hrithik Roshan', 'N. T. Rama Rao Jr.', 'Kiara Advani'] },
  3: { votes: '38.1K+ votes', certification: 'UA 16+', formats: ['2D', 'IMAX 2D'], description: 'A legendary figure returns to confront a powerful criminal network, setting off a gripping clash of loyalty, ambition and justice.', director: 'Lokesh Kanagaraj', cast: ['Rajinikanth', 'Nagarjuna', 'Shruti Haasan'] },
  5: { votes: '21.7K+ votes', certification: 'UA 16+', formats: ['2D', 'Dolby Cinema'], description: 'A mother steps into a world of ancient secrets and supernatural danger to protect the child she loves most.', director: 'Vishal Furia', cast: ['Kajol', 'Ronit Roy', 'Indraneil Sengupta'] },
  6: { votes: '44.2K+ votes', certification: 'A', formats: ['2D', 'IMAX 2D'], description: 'A new generation faces a terrifying chain of events as fate returns to collect a debt that began decades ago.', director: 'Zach Lipovsky, Adam B. Stein', cast: ['Kaitlyn Santa Juana', 'Teo Briones', 'Richard Harmon'] },
  7: { votes: '31.6K+ votes', certification: 'U', formats: ['2D', 'Dolby Cinema'], description: 'An unconventional coach and a spirited team discover that their biggest wins happen when they learn to believe in one another.', director: 'R. S. Prasanna', cast: ['Aamir Khan', 'Genelia Deshmukh', 'Dolly Ahluwalia'] },
  8: { votes: '48.9K+ votes', certification: 'U', formats: ['2D', 'IMAX 2D', 'Dolby Cinema'], description: 'On the rugged isle of Berk, an unlikely friendship between a young Viking and a dragon opens the door to a different future.', director: 'Dean DeBlois', cast: ['Mason Thames', 'Nico Parker', 'Gerard Butler'] },
  9: { votes: '18.3K+ votes', certification: 'UA 13+', formats: ['2D'], description: 'Across a changing city, several lives intersect through love, loss and the small moments that connect us all.', director: 'Anurag Basu', cast: ['Pankaj Tripathi', 'Neena Gupta', 'Aditya Roy Kapur'] },
};
