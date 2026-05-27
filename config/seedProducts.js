const db = require('./db');

const initialProducts = [
  // Flowers
  { title: "Roses Basket", price: 500, category: "Flowers", image: "/src/assets/flower 1.jpg", description: "Mixed Roses" },
  { title: "Mixed Flowers", price: 450, category: "Flowers", image: "/src/assets/flower 2.jpg", description: "Colorful bouquet" },
  { title: "Roses Bokeh", price: 500, category: "Flowers", image: "/src/assets/flower 3.jpg", description: "Fresh red,white roses" },
  { title: "Roses Bokeh (Pink)", price: 450, category: "Flowers", image: "/src/assets/flower 4.jpg", description: "Fresh pink flowers" },
  { title: "Roses Bokeh (White)", price: 500, category: "Flowers", image: "/src/assets/flower 5.jpeg", description: "Fresh white roses" },
  { title: "Tulip Bokeh", price: 450, category: "Flowers", image: "/src/assets/flower 6.png", description: "Colorful Tulip Flowers" },
  { title: "Mixed Flowers Premium", price: 450, category: "Flowers", image: "/src/assets/flower 7.avif", description: "Colorful bouquet" },
  { title: "Flowers Basket", price: 450, category: "Flowers", image: "/src/assets/flower 8.jpg", description: "Mixed Roses" },
  
  // Cakes
  { title: "Chocolate Cake", price: 700, category: "Cakes", image: "/src/assets/cake 1.jpg", description: "Rich chocolate flavor" },
  { title: "Birthday Cake Special", price: 900, category: "Cakes", image: "/src/assets/cake 2.webp", description: "Custom design" },
  { title: "Vanilla Cake", price: 700, category: "Cakes", image: "/src/assets/cake 3.jpg", description: "Rich vanilla flavor" },
  { title: "Birthday Party Cake", price: 900, category: "Cakes", image: "/src/assets/cake 4.jpg", description: "Custom design" },
  { title: "Classic Birthday Cake", price: 700, category: "Cakes", image: "/src/assets/cake 5.jpg", description: "Custom design" },
  { title: "Elegant Birthday Cake", price: 900, category: "Cakes", image: "/src/assets/cake 6.jpg", description: "Custom design" },
  { title: "Rainbow Cake", price: 700, category: "Cakes", image: "/src/assets/cake 7.jpg", description: "Rich multiple flavors" },
  { title: "Double Chocolate Cake", price: 700, category: "Cakes", image: "/src/assets/cake 8.jpg", description: "Rich chocolate flavor" },

  // Plants
  { title: "Indoor Jade Plant", price: 500, category: "Plants", image: "/src/assets/plant 1.jpg", description: "Luck and prosperity" },
  { title: "Mixed Succulents", price: 450, category: "Plants", image: "/src/assets/plant 2.jpg", description: "Low maintenance beauty" },
  { title: "Money Plant", price: 500, category: "Plants", image: "/src/assets/plant 3.jpg", description: "Fresh green leaves" },
  { title: "Snake Plant", price: 450, category: "Plants", image: "/src/assets/plant 4.webp", description: "Air purifying plant" },
  { title: "Peace Lily", price: 500, category: "Plants", image: "/src/assets/plant 5.jpg", description: "Elegant white blooms" },
  { title: "Aloe Vera", price: 450, category: "Plants", image: "/src/assets/plant 6.jpg", description: "Medicinal and fresh" },
  { title: "Fern Basket", price: 450, category: "Plants", image: "/src/assets/plant 7.avif", description: "Lush green hanging plant" },
  { title: "Bamboo Shoots", price: 450, category: "Plants", image: "/src/assets/plant 8.jpg", description: "Tabletop greenery" },

  // Gifts
  { title: "Greeting Hamper", price: 500, category: "Gifts", image: "/src/assets/gift 1.webp", description: "Personalized card & chocolate" },
  { title: "Teddy & Flowers", price: 450, category: "Gifts", image: "/src/assets/gift 2.webp", description: "Cute combo for loved ones" },
  { title: "Luxury Gift Box", price: 500, category: "Gifts", image: "/src/assets/gift 3.jpg", description: "Premium surprise collection" },
  { title: "Anniversary Combo", price: 450, category: "Gifts", image: "/src/assets/gift 4.jpg", description: "Perfect for celebrations" },
  { title: "Chocolate Bouquet", price: 500, category: "Gifts", image: "/src/assets/gift 5.jpg", description: "Delicious arrangement" },
  { title: "Handmade Card Set", price: 450, category: "Gifts", image: "/src/assets/gift 6.webp", description: "Artistic expressions" },
  { title: "Couple Mugs", price: 450, category: "Gifts", image: "/src/assets/gift 7.jpg", description: "Ideal for coffee lovers" },
  { title: "Personalized Photo Frame", price: 450, category: "Gifts", image: "/src/assets/gift 8.jpg", description: "Memories preserved" }
];

const seedProducts = async () => {
  try {
    // We clear current seeding if we want to refresh with new categories
    // For simplicity, we just check if any exist. 
    // If you want to FORCE update, change logic to: await db.query('DELETE FROM products');
    
    const checkCount = await db.query('SELECT COUNT(*) FROM products');
    if (parseInt(checkCount.rows[0].count) >= initialProducts.length) {
      console.log('Skipping product seeding: Products already appear fully seeded.');
      return;
    }

    // Clear and re-seed to ensure all categories are present
    console.log('🌱 Refreshing product database...');
    await db.query('TRUNCATE products CASCADE');

    for (const p of initialProducts) {
      await db.query(
        'INSERT INTO products (name, price, category, image, description) VALUES ($1, $2, $3, $4, $5)',
        [p.title, p.price, p.category, p.image, p.description]
      );
    }
    console.log('✅ Seeding complete.');
  } catch (error) {
    console.error('❌ Seeding Error:', error);
  }
};

module.exports = seedProducts;
