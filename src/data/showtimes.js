export const theatres = [
  {
    id: 'cinepolis-nexus', name: 'Cinépolis: Nexus Seawoods', location: 'Nerul, Navi Mumbai', initials: 'C', cancellationAvailable: true,
    amenities: ['Dolby Atmos', 'Recliner', 'Food & drinks'],
    shows: [
      { time: '10:15 AM', format: '2D', language: 'Hindi', price: 180, availability: 'AVAILABLE' },
      { time: '01:30 PM', format: 'IMAX', language: 'Hindi', price: 320, availability: 'FAST FILLING' },
      { time: '06:45 PM', format: '2D', language: 'Hindi', price: 220, availability: 'AVAILABLE' },
      { time: '10:15 PM', format: '2D', language: 'Hindi', price: 200, availability: 'FAST FILLING' },
    ],
  },
  {
    id: 'pvr-inorbit', name: 'PVR: INOX Inorbit Mall', location: 'Vashi, Navi Mumbai', initials: 'P', cancellationAvailable: false,
    amenities: ['4K projection', 'Dolby Atmos', 'Food & drinks'],
    shows: [
      { time: '09:00 AM', format: '2D', language: 'Hindi', price: 150, availability: 'AVAILABLE' },
      { time: '12:45 PM', format: '3D', language: 'Hindi', price: 270, availability: 'AVAILABLE' },
      { time: '04:20 PM', format: '2D', language: 'Hindi', price: 190, availability: 'FAST FILLING' },
      { time: '11:30 PM', format: '2D', language: 'Hindi', price: 170, availability: 'AVAILABLE' },
    ],
  },
  {
    id: 'imax-grand', name: 'INOX: Raghuleela Mall', location: 'Vashi, Navi Mumbai', initials: 'I', cancellationAvailable: true,
    amenities: ['IMAX', 'Recliner', 'Parking'],
    shows: [
      { time: '11:00 AM', format: 'IMAX', language: 'English', price: 350, availability: 'AVAILABLE' },
      { time: '03:15 PM', format: '2D', language: 'English', price: 210, availability: 'SOLD OUT' },
      { time: '07:30 PM', format: 'IMAX', language: 'English', price: 380, availability: 'FAST FILLING' },
      { time: '12:15 AM', format: '2D', language: 'English', price: 190, availability: 'AVAILABLE' },
    ],
  },
  {
    id: 'movie-max', name: 'MovieMax: Satra Plaza', location: 'Sector 19D, Vashi', initials: 'M', cancellationAvailable: false,
    amenities: ['Dolby sound', 'Food & drinks'],
    shows: [
      { time: '08:30 AM', format: '2D', language: 'Hindi', price: 130, availability: 'AVAILABLE' },
      { time: '02:00 PM', format: '2D', language: 'Hindi', price: 160, availability: 'AVAILABLE' },
      { time: '08:00 PM', format: '3D', language: 'Hindi', price: 240, availability: 'FAST FILLING' },
      { time: '10:45 PM', format: '2D', language: 'Hindi', price: 150, availability: 'SOLD OUT' },
    ],
  },
];
