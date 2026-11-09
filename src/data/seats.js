const soldSeats = new Set(['I2', 'I9', 'H5', 'H11', 'G3', 'G8', 'F1', 'F12', 'E6', 'D4', 'D10', 'C2', 'B7', 'A11']);
const bestsellerSeats = new Set(['I5', 'I6', 'H6', 'G5', 'G6', 'F7', 'E5', 'E6', 'D6', 'C7']);

const rowCategories = {
  I: 'PREMIUM', H: 'PREMIUM', G: 'GOLD', F: 'GOLD', E: 'EXECUTIVE', D: 'EXECUTIVE', C: 'EXECUTIVE', B: 'EXECUTIVE', A: 'EXECUTIVE',
};

const categoryPrices = { PREMIUM: 420, GOLD: 300, EXECUTIVE: 240 };

export const seatRows = Object.entries(rowCategories).map(([row, category]) => ({
  row,
  category,
  price: categoryPrices[category],
  seats: Array.from({ length: 12 }, (_, index) => {
    const number = index + 1;
    const id = `${row}${number}`;
    const isSold = soldSeats.has(id);
    return {
      id,
      row,
      number,
      category,
      price: categoryPrices[category],
      status: isSold ? 'SOLD' : bestsellerSeats.has(id) ? 'BESTSELLER' : 'AVAILABLE',
    };
  }),
}));
