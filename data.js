// FAKRUDEEN MART - product catalogue (54 products, 6 separate sections)
// Format: [category, name, price in INR, image keyword]
// Photos are real photographs loaded by keyword (needs internet). To use your own
// photos, replace the image URL in app.js -> imgUrl() or put files in an /images folder.

const CATEGORIES = [
  { id: 'dress',       label: 'Dress' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'toys',        label: 'Toys' },
  { id: 'courses',     label: 'Courses' },
  { id: 'fashion',     label: 'Fashion' },
  { id: 'jewelry',     label: 'Jewelry' }
];

const RAW_PRODUCTS = [
  // ---- Dress ----
  ['dress', 'Kanchipuram Silk Saree', 8999, 'saree'],
  ['dress', 'Men Formal Cotton Shirt', 1299, 'shirt'],
  ['dress', 'Classic Denim Jacket', 2499, 'denimjacket'],
  ['dress', 'Embroidered Kurta Set', 1899, 'kurta'],
  ['dress', 'Evening Party Gown', 5499, 'gown'],
  ['dress', 'Premium Cotton T-Shirt', 599, 'tshirt'],
  ['dress', 'Winter Fleece Hoodie', 1799, 'hoodie'],
  ['dress', 'Bridal Lehenga Choli', 15999, 'lehenga'],
  ['dress', 'Slim Fit Blazer', 4299, 'blazer'],

  // ---- Electronics ----
  ['electronics', 'Flagship 5G Smartphone', 54999, 'smartphone'],
  ['electronics', 'Ultra-Slim Laptop', 74999, 'laptop'],
  ['electronics', 'Wireless Earbuds Pro', 4999, 'earbuds'],
  ['electronics', 'Smart Watch Series X', 12999, 'smartwatch'],
  ['electronics', '55-inch 4K Smart TV', 38999, 'television'],
  ['electronics', 'Bluetooth Party Speaker', 6999, 'speaker'],
  ['electronics', 'DSLR Camera Kit', 46999, 'dslr'],
  ['electronics', 'Gaming Console', 44999, 'gamecontroller'],
  ['electronics', '10-inch Android Tablet', 17999, 'tablet'],

  // ---- Toys ----
  ['toys', 'Giant Teddy Bear', 1499, 'teddybear'],
  ['toys', 'Remote Control Racing Car', 2199, 'toycar'],
  ['toys', 'Colourful Building Blocks', 1299, 'lego'],
  ['toys', '1000-Piece Jigsaw Puzzle', 799, 'jigsaw'],
  ['toys', 'Wooden Doll House', 3499, 'dollhouse'],
  ['toys', 'Family Board Game', 999, 'boardgame'],
  ['toys', 'Transforming Robot', 1899, 'robot'],
  ['toys', 'Superhero Action Figure', 699, 'actionfigure'],
  ['toys', 'Kids Ukulele', 1599, 'ukulele'],

  // ---- Courses ----
  ['courses', 'Full-Stack Web Development', 3999, 'coding'],
  ['courses', 'Python Programming Masterclass', 2999, 'python'],
  ['courses', 'Data Science & AI Bootcamp', 5999, 'datascience'],
  ['courses', 'Digital Marketing Pro', 2499, 'marketing'],
  ['courses', 'Graphic Design Essentials', 1999, 'graphicdesign'],
  ['courses', 'Photography Workshop', 2299, 'photography'],
  ['courses', 'Spoken English Course', 1499, 'classroom'],
  ['courses', 'Stock Market Basics', 1799, 'stockmarket'],
  ['courses', 'Yoga & Wellness Program', 999, 'yoga'],

  // ---- Fashion ----
  ['fashion', 'Leather Handbag', 3999, 'handbag'],
  ['fashion', 'Running Sneakers', 3299, 'sneakers'],
  ['fashion', 'Aviator Sunglasses', 1999, 'sunglasses'],
  ['fashion', 'Genuine Leather Wallet', 899, 'wallet'],
  ['fashion', 'Travel Backpack', 2299, 'backpack'],
  ['fashion', 'Designer High Heels', 2799, 'highheels'],
  ['fashion', 'Premium Leather Belt', 799, 'leatherbelt'],
  ['fashion', 'Pashmina Scarf', 1599, 'scarf'],
  ['fashion', 'Luxury Perfume 100ml', 4499, 'perfume'],

  // ---- Jewelry ----
  ['jewelry', '22K Gold Necklace', 89999, 'goldnecklace'],
  ['jewelry', 'Diamond Solitaire Ring', 64999, 'diamondring'],
  ['jewelry', 'Pearl Drop Earrings', 7999, 'pearlearrings'],
  ['jewelry', 'Gold Bracelet', 34999, 'goldbracelet'],
  ['jewelry', 'Silver Anklet Pair', 2499, 'anklet'],
  ['jewelry', 'Bridal Jewelry Set', 125999, 'bridaljewelry'],
  ['jewelry', 'Ruby Pendant', 18999, 'pendant'],
  ['jewelry', 'Traditional Gold Bangles', 56999, 'bangles'],
  ['jewelry', 'Men Gold Chain', 42999, 'goldchain']
];