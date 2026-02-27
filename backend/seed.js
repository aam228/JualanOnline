const { connectDB, client } = require('./config/db');

const sampleProducts = [
  // ========== ELEKTRONIK ==========
  {
    _id: "prod_iphone_15_pro_001",
    slug: "iphone-15-pro",
    name: "iPhone 15 Pro",
    brand: "Apple",
    category: {
      id: "cat_elektronik",
      name: "Elektronik",
      subcategory: {
        id: "subcat_smartphone",
        name: "Smartphone"
      }
    },
    description: {
      short: "Smartphone flagship dengan chip A17 Pro dan kamera 48MP",
      long: "iPhone 15 Pro menghadirkan chip A17 Pro yang revolusioner dengan performa luar biasa. Dilengkapi sistem kamera Pro dengan sensor 48MP, layar Super Retina XDR, dan desain titanium yang premium. Action Button yang dapat dikustomisasi memberikan akses cepat ke fitur favorit Anda."
    },
    images: [
      {
        url: "https://media.discordapp.net/attachments/1083708902123782186/1476925871972679691/iphone_15_pro_clear_case_with_magsafe_1_1-removebg-preview.png?ex=69a2e5e7&is=69a19467&hm=1fee877cdfcc571e9b62fa6342bf5bee4809911e118ab34a1f18fcce05711eec&=&format=webp&quality=lossless&width=1100&height=1100",
        alt: "iPhone 15 Pro tampak depan",
        isPrimary: true
      },
      {
        url: "https://media.discordapp.net/attachments/1083708902123782186/1476925871972679691/iphone_15_pro_clear_case_with_magsafe_1_1-removebg-preview.png?ex=69a2e5e7&is=69a19467&hm=1fee877cdfcc571e9b62fa6342bf5bee4809911e118ab34a1f18fcce05711eec&=&format=webp&quality=lossless&width=1100&height=1100",
        alt: "iPhone 15 Pro tampak belakang",
        isPrimary: false
      },
      {
        url: "https://media.discordapp.net/attachments/1083708902123782186/1476925871972679691/iphone_15_pro_clear_case_with_magsafe_1_1-removebg-preview.png?ex=69a2e5e7&is=69a19467&hm=1fee877cdfcc571e9b62fa6342bf5bee4809911e118ab34a1f18fcce05711eec&=&format=webp&quality=lossless&width=1100&height=1100",
        alt: "iPhone 15 Pro kamera",
        isPrimary: false
      }
    ],
    priceRange: {
      min: 18000000,
      max: 26000000,
      currency: "IDR"
    },
    variantOptions: [
      {
        name: "Warna",
        type: "color",
        values: ["Hitam", "Putih", "Biru"]
      },
      {
        name: "Storage",
        type: "size",
        values: ["128GB", "256GB", "512GB", "1TB"]
      }
    ],
    skus: [
      { sku: "IP15P-BLK-128", isActive: true, variants: { Warna: "Hitam", Storage: "128GB" }, stock: 0, price: 18000000, currency: "IDR" },
      { sku: "IP15P-BLK-256", isActive: true, variants: { Warna: "Hitam", Storage: "256GB" }, stock: 8, price: 20000000, currency: "IDR" },
      { sku: "IP15P-BLK-512", isActive: true, variants: { Warna: "Hitam", Storage: "512GB" }, stock: 3, price: 23000000, currency: "IDR" },
      { sku: "IP15P-BLK-1TB", isActive: false, variants: { Warna: "Hitam", Storage: "1TB" }, stock: 0, price: 26000000, currency: "IDR" },
      { sku: "IP15P-WHT-128", isActive: false, variants: { Warna: "Putih", Storage: "128GB" }, stock: 0, price: 18000000, currency: "IDR" },
      { sku: "IP15P-WHT-256", isActive: true, variants: { Warna: "Putih", Storage: "256GB" }, stock: 6, price: 20000000, currency: "IDR" },
      { sku: "IP15P-WHT-512", isActive: true, variants: { Warna: "Putih", Storage: "512GB" }, stock: 4, price: 23000000, currency: "IDR" },
      { sku: "IP15P-BLU-256", isActive: true, variants: { Warna: "Biru", Storage: "256GB" }, stock: 0, price: 20000000, currency: "IDR" },
      { sku: "IP15P-BLU-512", isActive: true, variants: { Warna: "Biru", Storage: "512GB" }, stock: 7, price: 23000000, currency: "IDR" }
    ],
    physical: {
      weight: 187,
      weightUnit: "gram",
      dimensions: {
        length: 146.6,
        width: 70.6,
        height: 8.25,
        unit: "mm"
      }
    },
    tags: ["smartphone", "apple", "iphone", "5g", "flagship"],
    isPublished: true,
    status: "available",
    ratings: {
      average: 4.8,
      count: 127
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "prod_samsung_s24_ultra_001",
    slug: "samsung-galaxy-s24-ultra",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    category: {
      id: "cat_elektronik",
      name: "Elektronik",
      subcategory: {
        id: "subcat_smartphone",
        name: "Smartphone"
      }
    },
    description: {
      short: "Smartphone dengan S Pen dan kamera 200MP",
      long: "Galaxy S24 Ultra adalah smartphone flagship Samsung dengan kamera 200MP yang menghasilkan foto detail luar biasa. Dilengkapi S Pen built-in, layar Dynamic AMOLED 2X 6.8 inci, dan baterai 5000mAh untuk produktivitas sepanjang hari."
    },
    images: [
      {
        url: "https://media.discordapp.net/attachments/1083708902123782186/1476926314257715412/samsung-galaxy-s24-ultra-thumbnail-titanium-gray-removebg-preview.png?ex=69a2e651&is=69a194d1&hm=33a1f5446f5d861e9a0757d167a00d34390d5056b99603db0c098fbaaa1306e4&=&format=webp&quality=lossless&width=1100&height=1100",
        alt: "Samsung Galaxy S24 Ultra tampak depan",
        isPrimary: true
      },
      {
        url: "https://media.discordapp.net/attachments/1083708902123782186/1476926314257715412/samsung-galaxy-s24-ultra-thumbnail-titanium-gray-removebg-preview.png?ex=69a2e651&is=69a194d1&hm=33a1f5446f5d861e9a0757d167a00d34390d5056b99603db0c098fbaaa1306e4&=&format=webp&quality=lossless&width=1100&height=1100",
        alt: "Samsung Galaxy S24 Ultra dengan S Pen",
        isPrimary: false
      }
    ],
    priceRange: {
      min: 19000000,
      max: 25000000,
      currency: "IDR"
    },
    variantOptions: [
      {
        name: "Warna",
        type: "color",
        values: ["Hitam", "Ungu", "Abu-abu"]
      },
      {
        name: "Storage",
        type: "size",
        values: ["256GB", "512GB", "1TB"]
      }
    ],
    skus: [
      { sku: "S24U-BLK-256", isActive: true, variants: { Warna: "Hitam", Storage: "256GB" }, stock: 12, price: 19000000, currency: "IDR" },
      { sku: "S24U-BLK-512", isActive: true, variants: { Warna: "Hitam", Storage: "512GB" }, stock: 8, price: 22000000, currency: "IDR" },
      { sku: "S24U-BLK-1TB", isActive: true, variants: { Warna: "Hitam", Storage: "1TB" }, stock: 3, price: 25000000, currency: "IDR" },
      { sku: "S24U-PRP-256", isActive: true, variants: { Warna: "Ungu", Storage: "256GB" }, stock: 15, price: 19000000, currency: "IDR" },
      { sku: "S24U-PRP-512", isActive: true, variants: { Warna: "Ungu", Storage: "512GB" }, stock: 5, price: 22000000, currency: "IDR" },
      { sku: "S24U-GRY-512", isActive: true, variants: { Warna: "Abu-abu", Storage: "512GB" }, stock: 6, price: 22000000, currency: "IDR" }
    ],
    physical: {
      weight: 232,
      weightUnit: "gram",
      dimensions: {
        length: 162.3,
        width: 79.0,
        height: 8.6,
        unit: "mm"
      }
    },
    tags: ["smartphone", "samsung", "galaxy", "s-pen", "200mp"],
    isPublished: true,
    status: "available",
    ratings: {
      average: 4.7,
      count: 89
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "prod_macbook_pro_14_m3_001",
    slug: "macbook-pro-14-m3",
    name: "MacBook Pro 14 M3",
    brand: "Apple",
    category: {
      id: "cat_elektronik",
      name: "Elektronik",
      subcategory: {
        id: "subcat_laptop",
        name: "Laptop"
      }
    },
    description: {
      short: "Laptop profesional dengan chip M3 untuk performa maksimal",
      long: "MacBook Pro 14 inci dengan chip M3 menghadirkan performa luar biasa untuk profesional kreatif. Layar Liquid Retina XDR, baterai tahan hingga 18 jam, dan sistem audio spatial yang memukau. Sempurna untuk video editing, 3D rendering, dan multitasking berat."
    },
    images: [
      {
        url: "https://media.discordapp.net/attachments/1083708902123782186/1476926693271801987/image.png?ex=69a2e6ab&is=69a1952b&hm=c45ed7f0142ad79311a1813093dd1a022d7106d2e5a9cb0ab6d3e900ec7f0fa0&=&format=webp&quality=lossless&width=1683&height=1604",
        alt: "MacBook Pro 14 M3 tampak depan",
        isPrimary: true
      },
      {
        url: "https://media.discordapp.net/attachments/1083708902123782186/1476926693271801987/image.png?ex=69a2e6ab&is=69a1952b&hm=c45ed7f0142ad79311a1813093dd1a022d7106d2e5a9cb0ab6d3e900ec7f0fa0&=&format=webp&quality=lossless&width=1683&height=1604",
        alt: "MacBook Pro 14 M3 tampak samping",
        isPrimary: false
      }
    ],
    priceRange: {
      min: 28000000,
      max: 42000000,
      currency: "IDR"
    },
    variantOptions: [
      {
        name: "Warna",
        type: "color",
        values: ["Silver", "Space Gray"]
      },
      {
        name: "RAM",
        type: "memory",
        values: ["8GB", "16GB", "32GB"]
      },
      {
        name: "Storage",
        type: "size",
        values: ["512GB", "1TB"]
      }
    ],
    skus: [
      { sku: "MBP14-SLV-8-512", isActive: true, variants: { Warna: "Silver", RAM: "8GB", Storage: "512GB" }, stock: 5, price: 28000000, currency: "IDR" },
      { sku: "MBP14-SLV-16-512", isActive: true, variants: { Warna: "Silver", RAM: "16GB", Storage: "512GB" }, stock: 8, price: 32000000, currency: "IDR" },
      { sku: "MBP14-SLV-16-1TB", isActive: true, variants: { Warna: "Silver", RAM: "16GB", Storage: "1TB" }, stock: 4, price: 36000000, currency: "IDR" },
      { sku: "MBP14-SLV-32-1TB", isActive: true, variants: { Warna: "Silver", RAM: "32GB", Storage: "1TB" }, stock: 2, price: 42000000, currency: "IDR" },
      { sku: "MBP14-GRY-8-512", isActive: false, variants: { Warna: "Space Gray", RAM: "8GB", Storage: "512GB" }, stock: 0, price: 28000000, currency: "IDR" },
      { sku: "MBP14-GRY-16-512", isActive: true, variants: { Warna: "Space Gray", RAM: "16GB", Storage: "512GB" }, stock: 6, price: 32000000, currency: "IDR" },
      { sku: "MBP14-GRY-16-1TB", isActive: true, variants: { Warna: "Space Gray", RAM: "16GB", Storage: "1TB" }, stock: 3, price: 36000000, currency: "IDR" }
    ],
    physical: {
      weight: 1600,
      weightUnit: "gram",
      dimensions: {
        length: 312.6,
        width: 221.2,
        height: 15.5,
        unit: "mm"
      }
    },
    tags: ["laptop", "apple", "macbook", "m3", "professional"],
    isPublished: true,
    status: "available",
    ratings: {
      average: 4.9,
      count: 56
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "prod_sony_wh1000xm5_001",
    slug: "sony-wh-1000xm5",
    name: "Sony WH-1000XM5",
    brand: "Sony",
    category: {
      id: "cat_elektronik",
      name: "Elektronik",
      subcategory: {
        id: "subcat_audio",
        name: "Audio"
      }
    },
    description: {
      short: "Headphone noise cancelling terbaik dengan audio berkualitas tinggi",
      long: "Sony WH-1000XM5 adalah headphone wireless premium dengan teknologi noise cancelling terdepan di industri. Dilengkapi 8 mikrofon untuk call quality yang jernih, baterai hingga 30 jam, dan kualitas audio Hi-Res yang memukau. Desain yang nyaman untuk penggunaan sepanjang hari."
    },
    images: [
      {
        url: "https://media.discordapp.net/attachments/1083708902123782186/1476927114962796655/image.png?ex=69a2e710&is=69a19590&hm=3cda063ae04b5cb8c719a0d23282b776494c14b758e6a4b2404bbddfd6d49b19&=&format=webp&quality=lossless&width=746&height=1144",
        alt: "Sony WH-1000XM5 Hitam",
        isPrimary: true
      },
      {
        url: "https://media.discordapp.net/attachments/1083708902123782186/1476927114962796655/image.png?ex=69a2e710&is=69a19590&hm=3cda063ae04b5cb8c719a0d23282b776494c14b758e6a4b2404bbddfd6d49b19&=&format=webp&quality=lossless&width=746&height=1144",
        alt: "Sony WH-1000XM5 detail",
        isPrimary: false
      }
    ],
    priceRange: {
      min: 5500000,
      max: 5500000,
      currency: "IDR"
    },
    variantOptions: [
      {
        name: "Warna",
        type: "color",
        values: ["Hitam", "Silver", "Putih"]
      }
    ],
    skus: [
      { sku: "WH1000XM5-BLK", isActive: true, variants: { Warna: "Hitam" }, stock: 15, price: 5500000, currency: "IDR" },
      { sku: "WH1000XM5-SLV", isActive: true, variants: { Warna: "Silver" }, stock: 8, price: 5500000, currency: "IDR" },
      { sku: "WH1000XM5-WHT", isActive: true, variants: { Warna: "Putih" }, stock: 12, price: 5500000, currency: "IDR" }
    ],
    physical: {
      weight: 250,
      weightUnit: "gram",
      dimensions: {
        length: 254,
        width: 220,
        height: 80,
        unit: "mm"
      }
    },
    tags: ["headphone", "sony", "noise-cancelling", "wireless", "premium"],
    isPublished: true,
    status: "available",
    ratings: {
      average: 4.8,
      count: 234
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "prod_apple_watch_s9_001",
    slug: "apple-watch-series-9",
    name: "Apple Watch Series 9",
    brand: "Apple",
    category: {
      id: "cat_elektronik",
      name: "Elektronik",
      subcategory: {
        id: "subcat_wearable",
        name: "Smartwatch"
      }
    },
    description: {
      short: "Smartwatch dengan fitur kesehatan lengkap dan always-on display",
      long: "Apple Watch Series 9 dengan chip S9 SiP yang powerful. Fitur kesehatan lengkap termasuk ECG, blood oxygen, dan sleep tracking. Always-on Retina display yang lebih terang, water resistant hingga 50 meter, dan integrasi sempurna dengan ekosistem Apple."
    },
    images: [
      {
        url: "https://media.discordapp.net/attachments/1083708902123782186/1476927280533078016/image.png?ex=69a2e737&is=69a195b7&hm=bf818086f27686a272ff8b82aaef271379d49e20b2bde791093bc1c9e05b8a68&=&format=webp&quality=lossless&width=1412&height=1641",
        alt: "Apple Watch Series 9",
        isPrimary: true
      },
      {
        url: "https://media.discordapp.net/attachments/1083708902123782186/1476927280533078016/image.png?ex=69a2e737&is=69a195b7&hm=bf818086f27686a272ff8b82aaef271379d49e20b2bde791093bc1c9e05b8a68&=&format=webp&quality=lossless&width=1412&height=1641",
        alt: "Apple Watch Series 9 tampak samping",
        isPrimary: false
      }
    ],
    priceRange: {
      min: 6500000,
      max: 7000000,
      currency: "IDR"
    },
    variantOptions: [
      {
        name: "Ukuran",
        type: "size",
        values: ["41mm", "45mm"]
      },
      {
        name: "Warna",
        type: "color",
        values: ["Midnight", "Starlight", "Pink"]
      }
    ],
    skus: [
      { sku: "AW9-41-MID", isActive: true, variants: { Ukuran: "41mm", Warna: "Midnight" }, stock: 10, price: 6500000, currency: "IDR" },
      { sku: "AW9-41-STR", isActive: true, variants: { Ukuran: "41mm", Warna: "Starlight" }, stock: 8, price: 6500000, currency: "IDR" },
      { sku: "AW9-41-PNK", isActive: true, variants: { Ukuran: "41mm", Warna: "Pink" }, stock: 12, price: 6500000, currency: "IDR" },
      { sku: "AW9-45-MID", isActive: true, variants: { Ukuran: "45mm", Warna: "Midnight" }, stock: 7, price: 7000000, currency: "IDR" },
      { sku: "AW9-45-STR", isActive: true, variants: { Ukuran: "45mm", Warna: "Starlight" }, stock: 5, price: 7000000, currency: "IDR" },
      { sku: "AW9-45-PNK", isActive: false, variants: { Ukuran: "45mm", Warna: "Pink" }, stock: 0, price: 7000000, currency: "IDR" }
    ],
    physical: {
      weight: 32,
      weightUnit: "gram",
      dimensions: {
        length: 41,
        width: 35,
        height: 10.7,
        unit: "mm"
      }
    },
    tags: ["smartwatch", "apple", "watch", "fitness", "health"],
    isPublished: true,
    status: "available",
    ratings: {
      average: 4.7,
      count: 178
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "prod_ipad_air_m2_001",
    slug: "ipad-air-m2",
    name: "iPad Air M2",
    brand: "Apple",
    category: {
      id: "cat_elektronik",
      name: "Elektronik",
      subcategory: {
        id: "subcat_tablet",
        name: "Tablet"
      }
    },
    description: {
      short: "Tablet powerful dengan chip M2 dan layar Liquid Retina",
      long: "iPad Air dengan chip Apple M2 menghadirkan performa luar biasa untuk produktivitas dan kreativitas. Dilengkapi layar Liquid Retina 11 inci yang memukau dan mendukung Apple Pencil generasi terbaru. Sempurna untuk multitasking, gaming, dan content creation."
    },
    images: [
      {
        url: "https://media.discordapp.net/attachments/1083708902123782186/1476927668153880637/apple_ipad_air_11_inci_m3_wi-fi_blue_1-removebg-preview.png?ex=69a2e794&is=69a19614&hm=0f54790d7a1f470b9e51356ad0d26212001b82c406882d407f4c25216807a118&=&format=webp&quality=lossless&width=1100&height=1100",
        alt: "iPad Air M2 tampak depan",
        isPrimary: true
      },
      {
        url: "https://media.discordapp.net/attachments/1083708902123782186/1476927668153880637/apple_ipad_air_11_inci_m3_wi-fi_blue_1-removebg-preview.png?ex=69a2e794&is=69a19614&hm=0f54790d7a1f470b9e51356ad0d26212001b82c406882d407f4c25216807a118&=&format=webp&quality=lossless&width=1100&height=1100",
        alt: "iPad Air M2 tampak belakang",
        isPrimary: false
      }
    ],
    priceRange: {
      min: 9500000,
      max: 11000000,
      currency: "IDR"
    },
    variantOptions: [
      {
        name: "Warna",
        type: "color",
        values: ["Space Gray", "Starlight", "Purple"]
      },
      {
        name: "Storage",
        type: "size",
        values: ["128GB", "256GB"]
      }
    ],
    skus: [
      { sku: "IPAD-GRY-128", isActive: true, variants: { Warna: "Space Gray", Storage: "128GB" }, stock: 10, price: 9500000, currency: "IDR" },
      { sku: "IPAD-GRY-256", isActive: true, variants: { Warna: "Space Gray", Storage: "256GB" }, stock: 6, price: 11000000, currency: "IDR" },
      { sku: "IPAD-STR-128", isActive: true, variants: { Warna: "Starlight", Storage: "128GB" }, stock: 8, price: 9500000, currency: "IDR" },
      { sku: "IPAD-STR-256", isActive: true, variants: { Warna: "Starlight", Storage: "256GB" }, stock: 4, price: 11000000, currency: "IDR" },
      { sku: "IPAD-PRP-128", isActive: true, variants: { Warna: "Purple", Storage: "128GB" }, stock: 12, price: 9500000, currency: "IDR" },
      { sku: "IPAD-PRP-256", isActive: false, variants: { Warna: "Purple", Storage: "256GB" }, stock: 0, price: 11000000, currency: "IDR" }
    ],
    physical: {
      weight: 461,
      weightUnit: "gram",
      dimensions: {
        length: 247.6,
        width: 178.5,
        height: 6.1,
        unit: "mm"
      }
    },
    tags: ["tablet", "apple", "m2", "ipad", "elektronik"],
    isPublished: true,
    status: "available",
    ratings: {
      average: 4.6,
      count: 92
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "prod_bape_hoodie_001",
    slug: "bape-shark-hoodie-camo",
    name: "BAPE Shark Hoodie Camo",
    brand: "A Bathing Ape",
    category: {
      id: "cat_streetwear",
      name: "Streetwear",
      subcategory: {
        id: "subcat_hoodie",
        name: "Hoodie"
      }
    },
    description: {
      short: "Iconic shark hoodie dengan camo pattern khas BAPE",
      long: "BAPE Shark Hoodie adalah salah satu item paling ikonik dalam streetwear culture."
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80",
        alt: "BAPE Shark Hoodie",
        isPrimary: true
      }
    ],
    priceRange: { min: 3500000, max: 3500000, currency: "IDR" },
    variantOptions: [
      { name: "Warna", type: "color", values: ["Green Camo", "Blue Camo", "Black"] },
      { name: "Size", type: "size", values: ["S", "M", "L", "XL"] }
    ],
    skus: [
      { sku: "BAPE-GRN-M", isActive: true, variants: { Warna: "Green Camo", Size: "M" }, stock: 5, price: 3500000, currency: "IDR" },
      { sku: "BAPE-BLU-L", isActive: true, variants: { Warna: "Blue Camo", Size: "L" }, stock: 3, price: 3500000, currency: "IDR" }
    ],
    physical: { weight: 800, weightUnit: "gram", dimensions: { length: 70, width: 60, height: 5, unit: "cm" } },
    tags: ["streetwear", "bape", "hoodie"],
    isPublished: true,
    status: "available",
    ratings: { average: 4.9, count: 156 },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedDatabase() {
  try {
    const db = await connectDB();
    await db.collection('products').deleteMany({});
    console.log('🗑️  Cleared existing products');
    const result = await db.collection('products').insertMany(sampleProducts);
    console.log(`✅ Inserted ${result.insertedCount} products`);
  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Database seeding completed');
    process.exit(0);
  }
}

seedDatabase();
