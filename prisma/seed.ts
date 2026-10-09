import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ZimMarket database...');

  // Clean existing data
  await prisma.aIRequest.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.ad.deleteMany();
  await prisma.adCampaign.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favourite.deleteMany();
  await prisma.savedSearch.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.blockedUser.deleteMany();
  await prisma.report.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listingVideo.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.session.deleteMany();
  await prisma.staffAccount.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await prisma.systemConfig.deleteMany();

  // Create roles
  console.log('Creating roles...');
  const roles = await Promise.all([
    prisma.role.create({ data: { name: 'super_admin', description: 'Full system access' } }),
    prisma.role.create({ data: { name: 'admin', description: 'Administrative access' } }),
    prisma.role.create({ data: { name: 'moderator', description: 'Content moderation' } }),
    prisma.role.create({ data: { name: 'support', description: 'Customer support' } }),
  ]);

  // Create categories
  console.log('Creating categories...');
  const categoryData = [
    { name: 'Vehicles', slug: 'vehicles', icon: '🚗', sortOrder: 1 },
    { name: 'Property', slug: 'property', icon: '🏠', sortOrder: 2 },
    { name: 'Phones & Electronics', slug: 'phones-electronics', icon: '📱', sortOrder: 3 },
    { name: 'Computers', slug: 'computers', icon: '💻', sortOrder: 4 },
    { name: 'Furniture', slug: 'furniture', icon: '🪑', sortOrder: 5 },
    { name: 'Home Appliances', slug: 'home-appliances', icon: '🔌', sortOrder: 6 },
    { name: 'Fashion', slug: 'fashion', icon: '👗', sortOrder: 7 },
    { name: 'Beauty', slug: 'beauty', icon: '💄', sortOrder: 8 },
    { name: 'Agriculture', slug: 'agriculture', icon: '🌾', sortOrder: 9 },
    { name: 'Livestock', slug: 'livestock', icon: '🐄', sortOrder: 10 },
    { name: 'Machinery', slug: 'machinery', icon: '⚙️', sortOrder: 11 },
    { name: 'Mining Equipment', slug: 'mining-equipment', icon: '⛏️', sortOrder: 12 },
    { name: 'Construction', slug: 'construction', icon: '🏗️', sortOrder: 13 },
    { name: 'Industrial Equipment', slug: 'industrial-equipment', icon: '🏭', sortOrder: 14 },
    { name: 'Tools', slug: 'tools', icon: '🔧', sortOrder: 15 },
    { name: 'Spare Parts', slug: 'spare-parts', icon: '🔩', sortOrder: 16 },
    { name: 'Jobs', slug: 'jobs', icon: '💼', sortOrder: 17 },
    { name: 'Services', slug: 'services', icon: '🤝', sortOrder: 18 },
    { name: 'Business Opportunities', slug: 'business-opportunities', icon: '📈', sortOrder: 19 },
    { name: 'Books', slug: 'books', icon: '📚', sortOrder: 20 },
    { name: 'Sports', slug: 'sports', icon: '⚽', sortOrder: 21 },
    { name: 'Baby & Kids', slug: 'baby-kids', icon: '🧸', sortOrder: 22 },
    { name: 'Food & Groceries', slug: 'food-groceries', icon: '🛒', sortOrder: 23 },
    { name: 'Musical Instruments', slug: 'musical-instruments', icon: '🎵', sortOrder: 24 },
    { name: 'Pets', slug: 'pets', icon: '🐾', sortOrder: 25 },
    { name: 'Other', slug: 'other', icon: '📦', sortOrder: 26 },
  ];

  const categories: Record<string, { id: string; name: string }> = {};
  for (const cat of categoryData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.name] = created;
  }

  // Helper function
  const hash = (pw: string) => bcrypt.hashSync(pw, 12);

  // Create demo users
  console.log('Creating demo users...');

  // Admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@zimmarket.co.zw',
      phone: '+263771000001',
      passwordHash: hash('Admin123!'),
      emailVerified: true,
      phoneVerified: true,
      accountType: 'ADMIN',
      profile: {
        create: {
          displayName: 'ZimMarket Admin',
          username: 'zimmarketadmin',
          bio: 'Platform administrator',
          locationCity: 'Harare',
          locationProvince: 'Harare',
          locationCountry: 'Zimbabwe',
        },
      },
    },
    include: { profile: true },
  });

  // Assign admin role
  await prisma.userRole.create({
    data: { userId: admin.id, roleId: roles[0].id },
  });

  // Seller users
  const sellers = [];
  const sellerData = [
    { email: 'seller@example.com', phone: '+263771000002', name: 'Tendai Moyo', username: 'tendaimoyo', city: 'Harare', province: 'Harare', bio: 'Electronics dealer in Harare. Trusted seller with 5+ years experience.' },
    { email: 'grace@example.com', phone: '+263771000003', name: 'Grace Chikowore', username: 'gracechik', city: 'Bulawayo', province: 'Bulawayo', bio: 'Fashion & beauty products. Quality guaranteed!' },
    { email: 'blessing@example.com', phone: '+263771000004', name: 'Blessing Ndlovu', username: 'blessingndlovu', city: 'Mutare', province: 'Manicaland', bio: 'Automotive parts and accessories dealer.' },
    { email: 'tinashe@example.com', phone: '+263771000005', name: 'Tinashe Mukamuri', username: 'tinasheM', city: 'Gweru', province: 'Midlands', bio: 'Furniture maker. Custom orders welcome.' },
    { email: 'chipo@example.com', phone: '+263771000006', name: 'Chipo Mupfumi', username: 'chipomup', city: 'Masvingo', province: 'Masvingo', bio: 'Agricultural supplies and equipment.' },
    { email: 'farai@example.com', phone: '+263771000007', name: 'Farai Zhou', username: 'faraizhou', city: 'Harare', province: 'Harare', bio: 'Property agent specializing in Harare residential.' },
    { email: 'rudo@example.com', phone: '+263771000008', name: 'Rudo Mapfumo', username: 'rudomaps', city: 'Kadoma', province: 'Mashonaland West', bio: 'General marketplace seller. Fast delivery!' },
    { email: 'munya@example.com', phone: '+263771000009', name: 'Munya Dube', username: 'munyadube', city: 'Kwekwe', province: 'Midlands', bio: 'Mining equipment and tools specialist.' },
  ];

  for (const sd of sellerData) {
    const user = await prisma.user.create({
      data: {
        email: sd.email,
        phone: sd.phone,
        passwordHash: hash('Seller123!'),
        emailVerified: true,
        phoneVerified: true,
        accountType: 'INDIVIDUAL_SELLER',
        profile: {
          create: {
            displayName: sd.name,
            username: sd.username,
            bio: sd.bio,
            locationCity: sd.city,
            locationProvince: sd.province,
            locationCountry: 'Zimbabwe',
          },
        },
      },
      include: { profile: true },
    });
    sellers.push(user);
  }

  // Business seller
  const businessSeller = await prisma.user.create({
    data: {
      email: 'business@techhub.co.zw',
      phone: '+263771000010',
      passwordHash: hash('Business123!'),
      emailVerified: true,
      phoneVerified: true,
      accountType: 'BUSINESS_SELLER',
      profile: {
        create: {
          displayName: 'TechHub Zimbabwe',
          username: 'techhubzim',
          bio: 'Zimbabwe\'s leading electronics retailer. Official distributor for major brands.',
          locationCity: 'Harare',
          locationProvince: 'Harare',
          locationCountry: 'Zimbabwe',
        },
      },
    },
    include: { profile: true },
  });
  sellers.push(businessSeller);

  // Buyer users
  const buyers = [];
  const buyerData = [
    { email: 'buyer@example.com', phone: '+263771000011', name: 'James Mafukidze', username: 'jamesmaf' },
    { email: 'mai@example.com', phone: '+263771000012', name: 'Mai Tanaka', username: 'maitanaka' },
    { email: 'tapiwa@example.com', phone: '+263771000013', name: 'Tapiwa Ncube', username: 'tapiwancube' },
  ];

  for (const bd of buyerData) {
    const user = await prisma.user.create({
      data: {
        email: bd.email,
        phone: bd.phone,
        passwordHash: hash('Buyer123!'),
        emailVerified: true,
        phoneVerified: false,
        accountType: 'BUYER',
        profile: {
          create: {
            displayName: bd.name,
            username: bd.username,
            locationCity: 'Harare',
            locationProvince: 'Harare',
            locationCountry: 'Zimbabwe',
          },
        },
      },
      include: { profile: true },
    });
    buyers.push(user);
  }

  // Create verification requests for some sellers
  console.log('Creating verification requests...');
  await prisma.verificationRequest.create({
    data: { userId: sellers[0].id, currentLevel: 2, requestedLevel: 2, status: 'APPROVED', documentType: 'NATIONAL_ID' },
  });
  await prisma.verificationRequest.create({
    data: { userId: sellers[1].id, currentLevel: 1, requestedLevel: 2, status: 'APPROVED', documentType: 'NATIONAL_ID' },
  });
  await prisma.verificationRequest.create({
    data: { userId: businessSeller.id, currentLevel: 3, requestedLevel: 3, status: 'APPROVED', documentType: 'BUSINESS_REG', businessName: 'TechHub Zimbabwe (Pvt) Ltd', businessRegNum: 'ZW-2024-12345' },
  });

  // Create listings
  console.log('Creating sample listings...');
  const listingData = [
    // Vehicles
    { sellerIdx: 0, cat: 'Vehicles', title: 'Toyota Corolla Axio 2015 - Clean, Low Mileage', desc: 'Well-maintained Toyota Corolla Axio 2015 model. Low mileage at 65,000km. Full service history available. New tyres, recent full service. AC works perfectly. Very fuel efficient - perfect for commuting in Harare. No mechanical issues. Cash or bank transfer accepted.', price: 5500, condition: 'USED_GOOD', brand: 'Toyota', model: 'Corolla Axio', year: 2015, city: 'Harare', province: 'Harare', negotiable: true, delivery: false },
    { sellerIdx: 2, cat: 'Vehicles', title: 'Honda Fit 2012 Hybrid - Economical City Car', desc: 'Honda Fit Hybrid 2012. Excellent fuel economy - over 20km/L. Clean interior, no dents. Power steering, electric windows, central locking. Great first car or commuter vehicle. Ready to drive away.', price: 3800, condition: 'USED_EXCELLENT', brand: 'Honda', model: 'Fit', year: 2012, city: 'Harare', province: 'Harare', negotiable: true, delivery: false },
    { sellerIdx: 2, cat: 'Vehicles', title: 'Nissan NP300 Hardbody 2008 - Reliable Workhorse', desc: 'Strong and reliable Nissan NP300 Hardbody. 2.5L diesel engine. Canopy included. Ideal for farming, construction, or business use. Recently serviced with new clutch kit.', price: 6200, condition: 'USED_GOOD', brand: 'Nissan', model: 'NP300', year: 2008, city: 'Bulawayo', province: 'Bulawayo', negotiable: true, delivery: false },

    // Phones & Electronics
    { sellerIdx: 0, cat: 'Phones & Electronics', title: 'Samsung Galaxy S23 Ultra 256GB - Brand New Sealed', desc: 'Brand new, sealed Samsung Galaxy S23 Ultra 256GB. Phantom Black. Full manufacturer warranty. Comes with original box and accessories. Bought from authorized dealer.', price: 850, condition: 'NEW', brand: 'Samsung', model: 'Galaxy S23 Ultra', city: 'Harare', province: 'Harare', negotiable: false, delivery: true },
    { sellerIdx: 0, cat: 'Phones & Electronics', title: 'iPhone 14 Pro Max 128GB - Like New Condition', desc: 'iPhone 14 Pro Max in Space Black. Used for 3 months only. Battery health 99%. No scratches or dents. Comes with box, charger, and original receipt. Face ID works perfectly.', price: 980, condition: 'LIKE_NEW', brand: 'Apple', model: 'iPhone 14 Pro Max', city: 'Harare', province: 'Harare', negotiable: true, delivery: true },
    { sellerIdx: 8, cat: 'Phones & Electronics', title: 'Tecno Spark 10 Pro - Budget Friendly Smartphone', desc: 'Tecno Spark 10 Pro 256GB. Good condition, used for 6 months. 6.8 inch display, 5000mAh battery. Perfect for students or anyone looking for an affordable smartphone.', price: 120, condition: 'USED_GOOD', brand: 'Tecno', model: 'Spark 10 Pro', city: 'Harare', province: 'Harare', negotiable: true, delivery: true },
    { sellerIdx: 0, cat: 'Phones & Electronics', title: 'Huawei Nova 9 - Great Camera Phone', desc: 'Huawei Nova 9 in stunning colour. 128GB storage. 50MP camera takes amazing photos. Fast charging. Good condition with minor wear.', price: 200, condition: 'USED_GOOD', brand: 'Huawei', model: 'Nova 9', city: 'Mutare', province: 'Manicaland', negotiable: true, delivery: true },

    // Computers
    { sellerIdx: 8, cat: 'Computers', title: 'Dell Latitude 5520 - Business Laptop i5 8GB 256GB SSD', desc: 'Dell Latitude 5520 laptop. Intel Core i5 11th gen, 8GB RAM, 256GB SSD. Windows 11 Pro. Perfect for work or university. Battery lasts 6+ hours. Includes charger and laptop bag.', price: 450, condition: 'USED_EXCELLENT', brand: 'Dell', model: 'Latitude 5520', city: 'Harare', province: 'Harare', negotiable: true, delivery: true },
    { sellerIdx: 8, cat: 'Computers', title: 'HP Pavilion 15 - Student Laptop Deal', desc: 'HP Pavilion 15. AMD Ryzen 5, 8GB RAM, 512GB SSD. Great for students - runs all major software. Comes with charger. Small cosmetic wear but works perfectly.', price: 380, condition: 'USED_GOOD', brand: 'HP', model: 'Pavilion 15', city: 'Gweru', province: 'Midlands', negotiable: true, delivery: true },
    { sellerIdx: 8, cat: 'Computers', title: 'Lenovo ThinkPad T480 - Refurbished Professional Laptop', desc: 'Professionally refurbished Lenovo ThinkPad T480. Intel i7 8th gen, 16GB RAM, 512GB SSD. New battery. 1-year warranty included. Ideal for professionals.', price: 520, condition: 'REFURBISHED', brand: 'Lenovo', model: 'ThinkPad T480', city: 'Harare', province: 'Harare', negotiable: false, delivery: true },

    // Property
    { sellerIdx: 5, cat: 'Property', title: '3-Bedroom House for Sale - Mount Pleasant, Harare', desc: 'Beautiful 3-bedroom house in Mount Pleasant, Harare. Standalone house with spacious rooms, modern kitchen, double garage, borehole, and electric fence. Close to schools and shops. Title deeds available.', price: 85000, condition: 'USED_EXCELLENT', city: 'Harare', province: 'Harare', negotiable: true, delivery: false },
    { sellerIdx: 5, cat: 'Property', title: '2-Bedroom Apartment to Rent - CBD, Bulawayo', desc: 'Modern 2-bedroom apartment in Bulawayo CBD. Fully furnished with DSTV, WiFi, and water included. Secure parking. Available immediately. 6-month lease minimum.', price: 250, condition: 'USED_GOOD', city: 'Bulawayo', province: 'Bulawayo', negotiable: false, delivery: false },
    { sellerIdx: 5, cat: 'Property', title: 'Residential Stand - Chitungwiza, 300sqm', desc: 'Clear title residential stand in Chitungwiza Unit N. 300 square metres. All services available (water, sewer, electricity). Ready to build. Surveyor\'s diagram available.', price: 4500, condition: 'NEW', city: 'Chitungwiza', province: 'Harare', negotiable: true, delivery: false },

    // Furniture
    { sellerIdx: 3, cat: 'Furniture', title: 'Solid Mahogany 6-Seater Dining Table Set', desc: 'Handcrafted solid mahogany dining table with 6 chairs. Beautiful finish, very sturdy. Made locally by skilled craftsmen. Can customize size and colour on order.', price: 350, condition: 'NEW', brand: 'Custom', city: 'Gweru', province: 'Midlands', negotiable: true, delivery: true },
    { sellerIdx: 3, cat: 'Furniture', title: '3-Piece Lounge Suite - Leather, Excellent Condition', desc: 'Premium leather 3-piece lounge suite. 2-seater sofa, 3-seater sofa, and single seater. Dark brown leather, very comfortable. Used in a formal sitting room only.', price: 600, condition: 'USED_EXCELLENT', city: 'Gweru', province: 'Midlands', negotiable: true, delivery: false },
    { sellerIdx: 3, cat: 'Furniture', title: 'Queen Size Bed Frame with Mattress', desc: 'Modern queen size bed frame with high-quality foam mattress. Bed frame is solid wood with storage drawers. Mattress is 6 months old - barely used. Moving sale!', price: 280, condition: 'LIKE_NEW', city: 'Harare', province: 'Harare', negotiable: true, delivery: true },

    // Home Appliances
    { sellerIdx: 6, cat: 'Home Appliances', title: 'Hisense 43" Smart TV - Full HD with Netflix', desc: 'Hisense 43 inch Full HD Smart TV. Built-in Netflix, YouTube, and other apps. WiFi enabled. Remote control included. Wall mount bracket included. 1 year old, works perfectly.', price: 280, condition: 'USED_EXCELLENT', brand: 'Hisense', city: 'Kadoma', province: 'Mashonaland West', negotiable: true, delivery: true },
    { sellerIdx: 6, cat: 'Home Appliances', title: 'Samsung Double Door Fridge - 300L', desc: 'Samsung double door refrigerator, 300 litres. Energy efficient. No frost. Water dispenser. Used for 2 years, excellent working condition. Selling due to relocation.', price: 420, condition: 'USED_GOOD', brand: 'Samsung', city: 'Kadoma', province: 'Mashonaland West', negotiable: true, delivery: false },

    // Agriculture
    { sellerIdx: 4, cat: 'Agriculture', title: 'Drip Irrigation Kit - 1 Hectare Complete System', desc: 'Complete drip irrigation system for 1 hectare. Includes main pipes, drip lines, filters, valves, and connectors. Brand new, still in packaging. Ideal for market gardening, tobacco, or horticulture.', price: 800, condition: 'NEW', city: 'Masvingo', province: 'Masvingo', negotiable: true, delivery: true },
    { sellerIdx: 4, cat: 'Agriculture', title: 'Maize Seed - SC403 Variety, 10kg Bag', desc: 'SC403 drought-tolerant maize seed. 10kg bag. Suitable for all regions in Zimbabwe. High yielding variety. Fresh stock for the current season.', price: 25, condition: 'NEW', city: 'Masvingo', province: 'Masvingo', negotiable: false, delivery: true },

    // Machinery
    { sellerIdx: 7, cat: 'Machinery', title: 'Tiger Grinder 3-Phase Industrial', desc: 'Heavy-duty Tiger brand bench grinder. 3-phase power. Ideal for workshop, fabrication, or sharpening. Barely used - selling workshop equipment.', price: 180, condition: 'LIKE_NEW', brand: 'Tiger', city: 'Kwekwe', province: 'Midlands', negotiable: true, delivery: false },
    { sellerIdx: 7, cat: 'Machinery', title: 'Diesel Water Pump - 3 Inch, Self-Priming', desc: '3-inch diesel water pump. Self-priming, very powerful. Used for irrigation, construction dewatering, or mining. Comes with suction and delivery hoses.', price: 650, condition: 'USED_GOOD', city: 'Kwekwe', province: 'Midlands', negotiable: true, delivery: false },

    // Tools
    { sellerIdx: 7, cat: 'Tools', title: 'Bosch Professional Drill Set - Complete Kit', desc: 'Bosch Professional GSB 13 RE impact drill with full accessory kit. Includes drill bits, screwdriver bits, and carrying case. Light use only.', price: 85, condition: 'USED_EXCELLENT', brand: 'Bosch', city: 'Kwekwe', province: 'Midlands', negotiable: true, delivery: true },

    // Fashion
    { sellerIdx: 1, cat: 'Fashion', title: 'Nike Air Max 270 - US Size 10, New in Box', desc: 'Authentic Nike Air Max 270 sneakers. US size 10. Brand new, never worn. Bought from South Africa. Black/White colourway. Original box and tags.', price: 120, condition: 'NEW', brand: 'Nike', city: 'Bulawayo', province: 'Bulawayo', negotiable: false, delivery: true },
    { sellerIdx: 1, cat: 'Fashion', title: 'Men\'s Genuine Leather Formal Shoes - Size 9', desc: 'Genuine leather formal shoes for men. UK size 9. Black, polished finish. Made in Ethiopia. Very comfortable and durable. Worn twice only.', price: 45, condition: 'LIKE_NEW', city: 'Bulawayo', province: 'Bulawayo', negotiable: true, delivery: true },

    // Beauty
    { sellerIdx: 1, cat: 'Beauty', title: 'MAC Makeup Bundle - Foundation, Lipstick, Concealer', desc: 'MAC cosmetics bundle including Studio Fix foundation (NC45), Ruby Woo lipstick, and Pro Longwear concealer. All authentic, bought from Duty Free. Selling as a set.', price: 65, condition: 'NEW', brand: 'MAC', city: 'Bulawayo', province: 'Bulawayo', negotiable: false, delivery: true },

    // Services
    { sellerIdx: 0, cat: 'Services', title: 'Professional Photography - Events, Portraits, Products', desc: 'Professional photographer based in Harare. Specializing in events (weddings, parties), portrait photography, and product photography for online sellers. Competitive rates. Portfolio available on request.', price: 50, condition: 'NEW', city: 'Harare', province: 'Harare', negotiable: true, delivery: true },

    // Jobs
    { sellerIdx: 8, cat: 'Jobs', title: 'Sales Representative Wanted - Harare', desc: 'Growing electronics company seeking motivated sales representatives in Harare. Basic salary + commission. Must have own smartphone and be willing to travel. Previous sales experience preferred but not required.', price: 0, condition: 'NEW', city: 'Harare', province: 'Harare', negotiable: false, delivery: false },

    // Baby & Kids
    { sellerIdx: 6, cat: 'Baby & Kids', title: 'Baby Stroller - Graco, Foldable, Like New', desc: 'Graco baby stroller. Foldable, lightweight, with sun canopy and storage basket. Used for 6 months only. No stains or damage. Includes rain cover.', price: 75, condition: 'LIKE_NEW', brand: 'Graco', city: 'Kadoma', province: 'Mashonaland West', negotiable: true, delivery: true },

    // Books
    { sellerIdx: 3, cat: 'Books', title: 'ZIMSEC A-Level Textbooks Bundle - Sciences', desc: 'Complete set of A-Level textbooks for Physics, Chemistry, and Biology (ZIMSEC syllabus). Good condition with minimal highlighting. All 6 books included.', price: 40, condition: 'USED_GOOD', city: 'Gweru', province: 'Midlands', negotiable: true, delivery: true },

    // Sports
    { sellerIdx: 4, cat: 'Sports', title: 'Complete Gym Equipment Set - Dumbbells, Bench, Barbell', desc: 'Home gym set: adjustable dumbbells (up to 20kg each), flat bench, straight barbell, and weight plates (100kg total). Great for home workouts. Selling due to relocation.', price: 350, condition: 'USED_GOOD', city: 'Masvingo', province: 'Masvingo', negotiable: true, delivery: false },

    // Musical Instruments
    { sellerIdx: 1, cat: 'Musical Instruments', title: 'Yamaha Acoustic Guitar F310 - Beginner Friendly', desc: 'Yamaha F310 acoustic guitar. Great for beginners. Comes with tuner, picks, strap, and soft case. Good condition, recently restrung.', price: 95, condition: 'USED_GOOD', brand: 'Yamaha', city: 'Bulawayo', province: 'Bulawayo', negotiable: true, delivery: true },

    // Spare Parts
    { sellerIdx: 2, cat: 'Spare Parts', title: 'Toyota Corolla Axio Headlight Assembly - Right Side', desc: 'OEM headlight assembly for Toyota Corolla Axio 2012-2018, right side (passenger). Good working condition. Removed from a low-mileage vehicle.', price: 45, condition: 'USED_GOOD', brand: 'Toyota', city: 'Harare', province: 'Harare', negotiable: true, delivery: true },

    // Business Opportunities
    { sellerIdx: 4, cat: 'Business Opportunities', title: 'Franchise Opportunity - Fast Food Restaurant', desc: 'Exciting franchise opportunity for a well-known fast food brand in Zimbabwe. Looking for partners in Harare, Bulawayo, and Victoria Falls. Investment required: $15,000-$30,000. Full training and support provided.', price: 15000, condition: 'NEW', city: 'Harare', province: 'Harare', negotiable: false, delivery: false },

    // Pets
    { sellerIdx: 6, cat: 'Pets', title: 'German Shepherd Puppies - Purebred, Vaccinated', desc: 'Beautiful German Shepherd puppies available. Both parents on premises. Puppies are 8 weeks old, first vaccination done, dewormed. Health guarantee. KCCI registered parents.', price: 200, condition: 'NEW', city: 'Kadoma', province: 'Mashonaland West', negotiable: true, delivery: false },
  ];

  const createdListings = [];
  for (const ld of listingData) {
    const slug = ld.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 100) + '-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const seller = sellers[ld.sellerIdx];
    const cat = categories[ld.cat];

    const listing = await prisma.listing.create({
      data: {
        sellerId: seller.id,
        categoryId: cat.id,
        title: ld.title,
        slug,
        description: ld.desc,
        price: ld.price,
        currency: 'USD',
        isNegotiable: ld.negotiable,
        condition: ld.condition,
        brand: ld.brand || null,
        model: ld.model || null,
        year: ld.year || null,
        locationCountry: 'Zimbabwe',
        locationProvince: ld.province,
        locationCity: ld.city,
        deliveryAvailable: ld.delivery,
        status: 'ACTIVE',
        publishedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        viewCount: Math.floor(Math.random() * 500) + 10,
        favouriteCount: Math.floor(Math.random() * 20),
      },
    });
    createdListings.push(listing);
  }

  // Create reviews
  console.log('Creating reviews...');
  for (let i = 0; i < 15; i++) {
    const reviewer = buyers[i % buyers.length];
    const seller = sellers[i % sellers.length];
    const listing = createdListings[i % createdListings.length];
    const ratings = [4, 5, 5, 4, 3, 5, 4, 5, 5, 4, 5, 3, 4, 5, 5];
    const comments = [
      'Great seller! Fast communication and item was exactly as described.',
      'Very reliable. Would buy from again.',
      'Item was in good condition. Delivery was smooth.',
      'Good experience overall. Fair pricing.',
      'Professional seller. Highly recommended!',
      'Quick response and honest about item condition.',
      'Smooth transaction. Item quality exceeded expectations.',
      'Trustworthy seller with quality products.',
    ];

    try {
      await prisma.review.create({
        data: {
          authorId: reviewer.id,
          targetId: seller.id,
          listingId: listing.id,
          rating: ratings[i],
          comment: comments[i % comments.length],
          isVerified: true,
        },
      });
    } catch {
      // Skip duplicate reviews
    }
  }

  // Create favourites
  console.log('Creating favourites...');
  for (let i = 0; i < 10; i++) {
    try {
      await prisma.favourite.create({
        data: {
          userId: buyers[i % buyers.length].id,
          listingId: createdListings[i % createdListings.length].id,
        },
      });
    } catch {
      // Skip duplicates
    }
  }

  // Create follows
  console.log('Creating follows...');
  for (let i = 0; i < 8; i++) {
    try {
      await prisma.follow.create({
        data: {
          followerId: buyers[i % buyers.length].id,
          followingId: sellers[i % sellers.length].id,
        },
      });
    } catch {
      // Skip duplicates
    }
  }

  // Create subscription plans
  console.log('Creating subscription plans...');
  await prisma.subscriptionPlan.createMany({
    data: [
      { name: 'Free Seller', slug: 'free', description: 'Basic selling for everyone', price: 0, currency: 'USD', duration: 36500, maxListings: 5, maxImages: 3, boostCredits: 0, features: JSON.stringify(['5 active listings', '3 images per listing', 'Basic seller profile', 'Standard placement', 'Messaging']), sortOrder: 1 },
      { name: 'Seller Plus', slug: 'seller-plus', description: 'For serious sellers', price: 7, currency: 'USD', duration: 30, maxListings: 25, maxImages: 8, boostCredits: 3, features: JSON.stringify(['25 active listings', '8 images per listing', 'Advanced analytics', '3 listing boosts/month', 'Seller badge', 'Priority support', 'AI listing tools']), sortOrder: 2 },
      { name: 'Professional', slug: 'professional', description: 'For power sellers', price: 20, currency: 'USD', duration: 30, maxListings: 100, maxImages: 10, boostCredits: 10, features: JSON.stringify(['100 active listings', '10 images per listing', 'Advanced storefront', 'Advanced analytics', '10 boosts/month', 'Bulk listing upload', 'Staff accounts', 'Inventory management', 'AI seller assistant']), sortOrder: 3 },
      { name: 'Business Enterprise', slug: 'enterprise', description: 'Custom solution for businesses', price: 50, currency: 'USD', duration: 30, maxListings: 500, maxImages: 15, boostCredits: 50, features: JSON.stringify(['500 active listings', '15 images per listing', 'Multiple branches', 'Multiple staff accounts', 'Advanced permissions', 'API access', 'Dedicated support', 'Business verification', 'Custom advertising solutions']), sortOrder: 4 },
    ],
  });

  // Create some notifications
  console.log('Creating notifications...');
  for (const buyer of buyers) {
    await prisma.notification.createMany({
      data: [
        { userId: buyer.id, type: 'WELCOME', title: 'Welcome to ZimMarket!', body: 'Start exploring thousands of listings in Zimbabwe.', link: '/explore' },
        { userId: buyer.id, type: 'NEW_LISTINGS', title: 'New listings in your area', body: 'Check out the latest listings in Harare.', link: '/explore?city=Harare' },
      ],
    });
  }

  // Create system config
  console.log('Creating system config...');
  await prisma.systemConfig.createMany({
    data: [
      { key: 'site_name', value: 'ZimMarket', description: 'Platform name' },
      { key: 'site_tagline', value: 'Zimbabwe\'s Premier Marketplace', description: 'Platform tagline' },
      { key: 'default_currency', value: 'USD', description: 'Default currency' },
      { key: 'default_country', value: 'Zimbabwe', description: 'Default country' },
      { key: 'listing_expiry_days', value: '30', description: 'Days until listing expires' },
      { key: 'max_images_per_listing', value: '10', description: 'Maximum images per listing' },
      { key: 'max_file_size_mb', value: '10', description: 'Maximum upload file size in MB' },
      { key: 'auto_approve_listings', value: 'true', description: 'Auto-approve new listings' },
      { key: 'session_duration_days', value: '7', description: 'Session duration in days' },
      { key: 'min_password_length', value: '8', description: 'Minimum password length' },
    ],
  });

  // Create some audit logs
  console.log('Creating audit logs...');
  await prisma.auditLog.createMany({
    data: [
      { userId: admin.id, action: 'SYSTEM_INIT', details: JSON.stringify({ message: 'ZimMarket database seeded successfully' }) },
      { userId: admin.id, action: 'CATEGORY_CREATE', targetType: 'CATEGORY', details: JSON.stringify({ count: categoryData.length }) },
      { userId: admin.id, action: 'USER_CREATE', targetType: 'USER', details: JSON.stringify({ count: sellers.length + buyers.length + 1 }) },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log(`   - ${categoryData.length} categories`);
  console.log(`   - ${sellers.length + 1} sellers (including 1 business)`);
  console.log(`   - ${buyers.length} buyers`);
  console.log(`   - ${createdListings.length} listings`);
  console.log(`   - 1 admin user`);
  console.log(`   - 4 subscription plans`);
  console.log('');
  console.log('Demo accounts:');
  console.log('  Admin:  admin@zimmarket.co.zw / Admin123!');
  console.log('  Seller: seller@example.com / Seller123!');
  console.log('  Buyer:  buyer@example.com / Buyer123!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });