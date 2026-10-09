import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 12);
}

const CITIES = ['Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Kwekwe', 'Masvingo', 'Kadoma', 'Chitungwiza', 'Marondera', 'Victoria Falls', 'Chinhoyi', 'Bindura'];
const AREAS: Record<string, string[]> = {
  'Harare': ['Avondale', 'Borrowdale', 'Mount Pleasant', 'Eastlea', 'Greendale', 'Marlborough', 'Waterfalls', 'Mbare', 'Glen Norah', 'Budiriro'],
  'Bulawayo': ['Hillside', 'Suburbs', 'Morningside', 'North End', 'Famona', 'Barham Green', 'Nkulumane'],
  'Mutare': ['Sakubva', 'Dangamvura', 'Murambi', 'Fairbridge'],
  'Gweru': ['Senga', 'Woodlands', 'Ascot'],
  'Masvingo': ['Mucheke', 'Rujeko', 'Rhodene'],
};

async function main() {
  console.log('🌱 Seeding ZimMarket database...');

  // --- CATEGORIES ---
  const categories = [
    { name: 'Vehicles', slug: 'vehicles', icon: '🚗', sortOrder: 1 },
    { name: 'Property', slug: 'property', icon: '🏠', sortOrder: 2 },
    { name: 'Phones & Electronics', slug: 'phones-electronics', icon: '📱', sortOrder: 3 },
    { name: 'Computers', slug: 'computers', icon: '💻', sortOrder: 4 },
    { name: 'Furniture', slug: 'furniture', icon: '🛋️', sortOrder: 5 },
    { name: 'Fashion', slug: 'fashion', icon: '👗', sortOrder: 6 },
    { name: 'Home & Garden', slug: 'home-garden', icon: '🏡', sortOrder: 7 },
    { name: 'Services', slug: 'services', icon: '🔧', sortOrder: 8 },
    { name: 'Jobs', slug: 'jobs', icon: '💼', sortOrder: 9 },
    { name: 'Baby & Kids', slug: 'baby-kids', icon: '🧸', sortOrder: 10 },
    { name: 'Sports & Leisure', slug: 'sports-leisure', icon: '⚽', sortOrder: 11 },
    { name: 'Agriculture', slug: 'agriculture', icon: '🌾', sortOrder: 12 },
    { name: 'Health & Beauty', slug: 'health-beauty', icon: '💄', sortOrder: 13 },
    { name: 'Food & Beverages', slug: 'food-beverages', icon: '🍕', sortOrder: 14 },
    { name: 'Pets & Animals', slug: 'pets-animals', icon: '🐕', sortOrder: 15 },
    { name: 'Music & Instruments', slug: 'music-instruments', icon: '🎸', sortOrder: 16 },
    { name: 'Books & Education', slug: 'books-education', icon: '📚', sortOrder: 17 },
    { name: 'Office & Business', slug: 'office-business', icon: '🖨️', sortOrder: 18 },
    { name: 'Travel & Tourism', slug: 'travel-tourism', icon: '✈️', sortOrder: 19 },
    { name: 'Building Materials', slug: 'building-materials', icon: '🧱', sortOrder: 20 },
    { name: 'Security', slug: 'security', icon: '🔒', sortOrder: 21 },
    { name: 'Events & Entertainment', slug: 'events', icon: '🎉', sortOrder: 22 },
    { name: 'Art & Crafts', slug: 'art-crafts', icon: '🎨', sortOrder: 23 },
    { name: 'Free Stuff', slug: 'free-stuff', icon: '🎁', sortOrder: 24 },
    { name: 'Wanted', slug: 'wanted', icon: '🔍', sortOrder: 25 },
    { name: 'Other', slug: 'other', icon: '📦', sortOrder: 26 },
  ];

  const catMap: Record<string, string> = {};
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { icon: cat.icon, sortOrder: cat.sortOrder },
      create: cat,
    });
    catMap[cat.slug] = c.id;
  }
  console.log(`  ✅ ${categories.length} categories`);

  // --- DEMO USERS ---
  const passwordHash = await hashPassword('Demo1234!');

  const demoSellers = [
    { email: 'tendai.autos@gmail.com', displayName: 'Tendai Auto Sales', city: 'Harare', area: 'Avondale', bio: 'Trusted car dealer in Harare. 10+ years experience. All vehicles inspected.', phone: '+263771234567' },
    { email: 'grace.properties@gmail.com', displayName: 'Grace Properties', city: 'Harare', area: 'Borrowdale', bio: 'Real estate agent specializing in Harare residential and commercial properties.', phone: '+263772345678' },
    { email: 'blessing.tech@gmail.com', displayName: 'Blessing Tech Store', city: 'Bulawayo', area: 'Hillside', bio: 'Your one-stop shop for phones, laptops, and accessories. Free delivery in Bulawayo.', phone: '+263773456789' },
    { email: 'chipo.furniture@gmail.com', displayName: 'Chipo\'s Furniture', city: 'Mutare', area: 'Murambi', bio: 'Quality handmade and imported furniture. Custom orders welcome.', phone: '+263774567890' },
    { email: 'farai.farms@gmail.com', displayName: 'Farai Fresh Farms', city: 'Masvingo', area: 'Rujeko', bio: 'Fresh organic produce direct from our farm. Wholesale and retail.', phone: '+263775678901' },
  ];

  const sellerIds: string[] = [];
  for (const s of demoSellers) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        passwordHash,
        phone: s.phone,
        accountType: 'SELLER',
        emailVerified: true,
        isVerified: true,
        profile: {
          create: {
            displayName: s.displayName,
            username: s.displayName.toLowerCase().replace(/[^a-z0-9]/g, ''),
            bio: s.bio,
            locationCity: s.city,
            locationArea: s.area,
            locationCountry: 'Zimbabwe',
            showPhone: true,
          },
        },
      },
    });
    sellerIds.push(user.id);
  }
  console.log(`  ✅ ${demoSellers.length} demo sellers`);

  // --- DEMO LISTINGS ---
  const listings = [
    // Vehicles
    { seller: 0, cat: 'vehicles', title: 'Toyota Hilux 2019 4x4 Double Cab', price: 28000, currency: 'USD', condition: 'GOOD', city: 'Harare', area: 'Avondale', desc: 'Well-maintained Toyota Hilux 2.4L diesel. Full service history. New tyres. Canopy included. Single owner. Ready for work or personal use.', negotiable: true },
    { seller: 0, cat: 'vehicles', title: 'Honda Fit 2017 Hybrid Import', price: 8500, currency: 'USD', condition: 'LIKE_NEW', city: 'Harare', area: 'Eastlea', desc: 'Fresh from Japan. 45,000km. Full option with navigation, reverse camera. Excellent fuel economy. Duty paid.', negotiable: false },
    { seller: 0, cat: 'vehicles', title: 'Mercedes-Benz C200 2016 AMG Line', price: 18000, currency: 'USD', condition: 'GOOD', city: 'Bulawayo', area: 'Suburbs', desc: 'AMG package. Leather seats. Sunroof. Full service history at Zimoco. One owner from new.', negotiable: true },

    // Property
    { seller: 1, cat: 'property', title: '3-Bedroom House for Sale — Borrowdale', price: 120000, currency: 'USD', condition: 'NEW', city: 'Harare', area: 'Borrowdale', desc: 'Modern 3-bedroom house in Borrowdale West. Open plan kitchen, double garage, borehole, solar system, electric fence. Stand 1000sqm.', negotiable: true },
    { seller: 1, cat: 'property', title: 'Office Space to Rent — CBD', price: 800, currency: 'USD', condition: 'GOOD', city: 'Harare', area: 'CBD', desc: '150sqm office space in the heart of Harare CBD. 3 rooms, reception, kitchenette, parking. Available immediately.', negotiable: false },
    { seller: 1, cat: 'property', title: 'Vacant Stand — Mount Pleasant Heights', price: 35000, currency: 'USD', condition: 'NEW', city: 'Harare', area: 'Mount Pleasant', desc: '500sqm residential stand with approved plans. Serviced with water, sewer, and electricity. Quiet neighbourhood.', negotiable: true },

    // Phones & Electronics
    { seller: 2, cat: 'phones-electronics', title: 'Samsung Galaxy S24 Ultra 256GB', price: 950, currency: 'USD', condition: 'NEW', city: 'Bulawayo', area: 'Hillside', desc: 'Brand new, sealed. Titanium Black. 12-month warranty. Free screen protector and case included.', negotiable: false },
    { seller: 2, cat: 'phones-electronics', title: 'iPhone 15 Pro Max 512GB', price: 1400, currency: 'USD', condition: 'NEW', city: 'Bulawayo', area: 'Hillside', desc: 'Brand new, sealed box. Natural Titanium colour. Apple warranty. Free delivery in Bulawayo.', negotiable: false },
    { seller: 2, cat: 'phones-electronics', title: 'TCL 55" 4K Smart TV', price: 450, currency: 'USD', condition: 'NEW', city: 'Bulawayo', area: 'Suburbs', desc: 'Android TV built-in. Netflix, YouTube, Showmax ready. HDR10. Wall mount included. 2-year warranty.', negotiable: true },
    { seller: 2, cat: 'phones-electronics', title: 'Hisense 43" Full HD TV', price: 280, currency: 'USD', condition: 'NEW', city: 'Harare', area: 'Marlborough', desc: 'Smart TV with built-in WiFi. Perfect for bedrooms. Free HDMI cable included.', negotiable: false },

    // Computers
    { seller: 2, cat: 'computers', title: 'MacBook Pro M3 14" 512GB', price: 1800, currency: 'USD', condition: 'NEW', city: 'Bulawayo', area: 'Hillside', desc: 'Latest MacBook Pro with M3 chip. Space Black. 18GB RAM. AppleCare eligible. Sealed box.', negotiable: false },
    { seller: 2, cat: 'computers', title: 'Dell Latitude Laptop — Business Grade', price: 550, currency: 'USD', condition: 'LIKE_NEW', city: 'Harare', area: 'Avondale', desc: 'Dell Latitude 5530. i7 12th gen, 16GB RAM, 512GB SSD. 15.6" FHD. Perfect for office work. Charger included.', negotiable: true },
    { seller: 2, cat: 'computers', title: 'HP LaserJet Pro Printer', price: 180, currency: 'USD', condition: 'GOOD', city: 'Bulawayo', area: 'North End', desc: 'HP LaserJet Pro MFP. Print, scan, copy. WiFi enabled. Toner included. Great for small office.', negotiable: true },

    // Furniture
    { seller: 3, cat: 'furniture', title: 'Solid Oak 6-Seater Dining Set', price: 650, currency: 'USD', condition: 'NEW', city: 'Mutare', area: 'Murambi', desc: 'Handcrafted solid oak dining table with 6 chairs. Beautiful grain finish. Built to last generations. Custom sizes available.', negotiable: true },
    { seller: 3, cat: 'furniture', title: 'Leather 3-Piece Lounge Suite', price: 1200, currency: 'USD', condition: 'NEW', city: 'Mutare', area: 'Dangamvura', desc: 'Premium Italian leather. 3-seater sofa + 2-seater + armchair. Dark brown. Very comfortable. Delivery available.', negotiable: true },
    { seller: 3, cat: 'furniture', title: 'Queen Size Bed Frame + Mattress', price: 400, currency: 'USD', condition: 'NEW', city: 'Mutare', area: 'Murambi', desc: 'Modern upholstered bed frame with 10" memory foam mattress. Grey fabric. Very comfortable. Assembly included.', negotiable: false },

    // Agriculture
    { seller: 4, cat: 'agriculture', title: 'Fresh Tomatoes — 20kg Box', price: 15, currency: 'USD', condition: 'NEW', city: 'Masvingo', area: 'Rujeko', desc: 'Farm-fresh tomatoes. Grade A quality. Available weekly. Bulk discounts for restaurants and vendors. Delivery to Masvingo town.', negotiable: true },
    { seller: 4, cat: 'agriculture', title: 'Broiler Chickens — Live or Dressed', price: 8, currency: 'USD', condition: 'NEW', city: 'Masvingo', area: 'Rujeko', desc: 'Farm-fresh broiler chickens. Available live or dressed. Minimum order 10. Free delivery for orders over 50.', negotiable: true },
    { seller: 4, cat: 'agriculture', title: 'Cattle Feed — Dairy Meal 50kg', price: 25, currency: 'USD', condition: 'NEW', city: 'Masvingo', area: 'Rujeko', desc: 'High-protein dairy meal for lactating cows. 50kg bags. Bulk prices available. We also stock beef finisher and pig feed.', negotiable: false },

    // Fashion
    { seller: 0, cat: 'fashion', title: 'Nike Air Max 270 — Size 10', price: 85, currency: 'USD', condition: 'LIKE_NEW', city: 'Harare', area: 'Borrowdale', desc: 'Worn twice. Too big for me. Original box included. Authentic, bought from Nike store SA.', negotiable: false },
    { seller: 3, cat: 'fashion', title: 'Ankara Fabric — 6 Yards', price: 20, currency: 'USD', condition: 'NEW', city: 'Mutare', area: 'Sakubva', desc: 'Beautiful Ankara/African print fabric. 6 yards per piece. Multiple designs available. Perfect for dresses, shirts, or decor.', negotiable: true },

    // Services
    { seller: 0, cat: 'services', title: 'Professional Plumbing Services — Harare', price: 50, currency: 'USD', condition: 'NEW', city: 'Harare', area: 'Greendale', desc: 'Licensed plumber. 15 years experience. Burst pipes, geysers, renovations, new installations. Free quotes. Emergency callouts available.', negotiable: true },
    { seller: 3, cat: 'services', title: 'Graphic Design & Branding', price: 100, currency: 'USD', condition: 'NEW', city: 'Mutare', area: 'Fairbridge', desc: 'Logo design, business cards, flyers, social media graphics, branding packages. Fast turnaround. Portfolio available on request.', negotiable: true },
    { seller: 2, cat: 'services', title: 'Laptop Repair & Data Recovery', price: 30, currency: 'USD', condition: 'NEW', city: 'Bulawayo', area: 'Hillside', desc: 'Expert laptop repairs. Screen replacement, battery, keyboard, motherboard repair. Data recovery from dead drives. Same-day service.', negotiable: true },

    // Home & Garden
    { seller: 4, cat: 'home-garden', title: 'Solar Geyser — 200L Evacuated Tube', price: 650, currency: 'USD', condition: 'NEW', city: 'Harare', area: 'Waterfalls', desc: '200-litre solar geyser with evacuated tube collector. Saves up to 80% on electricity. Installation available. 5-year warranty.', negotiable: true },
    { seller: 3, cat: 'home-garden', title: 'Borehole Drilling — Special Offer', price: 1500, currency: 'USD', condition: 'NEW', city: 'Harare', area: 'Marlborough', desc: 'Professional borehole drilling. Site survey included. We handle ZINWA permits. Submersible pump installation available. Special price this month.', negotiable: true },

    // Baby & Kids
    { seller: 4, cat: 'baby-kids', title: 'Baby Stroller — Graco Modes', price: 120, currency: 'USD', condition: 'LIKE_NEW', city: 'Harare', area: 'Mount Pleasant', desc: 'Graco Modes 3-in-1 stroller. Used for 6 months. Excellent condition. Includes car seat adapter, rain cover, and cup holder.', negotiable: true },

    // Health & Beauty
    { seller: 4, cat: 'health-beauty', title: 'Natural Shea Butter — 500ml', price: 8, currency: 'USD', condition: 'NEW', city: 'Harare', area: 'Mbare', desc: '100% pure unrefined shea butter. Great for skin and hair. Bulk orders available. Can deliver nationwide.', negotiable: false },
  ];

  let listingCount = 0;
  for (const l of listings) {
    const city = l.city;
    const area = l.area;
    const existing = await prisma.listing.findFirst({ where: { title: l.title } });
    if (existing) continue;

    await prisma.listing.create({
      data: {
        sellerId: sellerIds[l.seller],
        categoryId: catMap[l.cat],
        title: l.title,
        slug: l.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80),
        description: l.desc,
        price: l.price,
        currency: l.currency,
        condition: l.condition,
        locationCity: city,
        locationArea: area,
        locationCountry: 'Zimbabwe',
        isNegotiable: l.negotiable,
        status: 'ACTIVE',
        publishedAt: new Date(),
        viewCount: Math.floor(Math.random() * 200) + 10,
        favouriteCount: Math.floor(Math.random() * 30),
      },
    });
    listingCount++;
  }
  console.log(`  ✅ ${listingCount} demo listings`);

  // --- SUBSCRIPTION PLANS ---
  const plans = [
    { name: 'Basic', slug: 'basic', price: 0, duration: 30, maxListings: 5, features: JSON.stringify(['5 listings', 'Basic search', 'Standard support']), sortOrder: 1 },
    { name: 'Pro Seller', slug: 'pro-seller', price: 9.99, duration: 30, maxListings: 999, features: JSON.stringify(['Unlimited listings', 'Priority placement', 'Analytics', 'Verified badge']), sortOrder: 2 },
    { name: 'Business', slug: 'business', price: 29.99, duration: 30, maxListings: 999, features: JSON.stringify(['Everything in Pro', 'Team accounts', 'API access', 'Dedicated support']), sortOrder: 3 },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      update: { price: plan.price, features: plan.features },
      create: plan,
    });
  }
  console.log(`  ✅ ${plans.length} subscription plans`);

  console.log('\n🎉 Seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());