// ZimMarket Utility Functions

export function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]) {
  return inputs
    .filter(Boolean)
    .map((input) => {
      if (typeof input === 'string') return input;
      if (typeof input === 'object' && input !== null) {
        return Object.entries(input)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(' ');
      }
      return '';
    })
    .join(' ')
    .trim();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

export function formatPrice(price: number, currency: string = 'USD'): string {
  if (currency === 'USD') return `$${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  if (currency === 'ZiG') return `ZiG ${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  return `${currency} ${price.toLocaleString('en-US')}`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-ZW', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function getVerificationBadge(level: number): { label: string; color: string; icon: string } {
  switch (level) {
    case 0: return { label: 'Unverified', color: 'text-gray-400', icon: '○' };
    case 1: return { label: 'Phone Verified', color: 'text-blue-500', icon: '◉' };
    case 2: return { label: 'ID Verified', color: 'text-green-500', icon: '✓' };
    case 3: return { label: 'Business Verified', color: 'text-purple-500', icon: '✓✓' };
    case 4: return { label: 'Trusted Seller', color: 'text-amber-500', icon: '★' };
    default: return { label: 'Unverified', color: 'text-gray-400', icon: '○' };
  }
}

export function getConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    NEW: 'Brand New',
    LIKE_NEW: 'Like New',
    USED_EXCELLENT: 'Used - Excellent',
    USED_GOOD: 'Used - Good',
    USED_FAIR: 'Used - Fair',
    FOR_PARTS: 'For Parts',
    REFURBISHED: 'Refurbished',
  };
  return labels[condition] || condition;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    DRAFT: 'bg-gray-100 text-gray-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    SOLD: 'bg-blue-100 text-blue-800',
    EXPIRED: 'bg-red-100 text-red-800',
    REJECTED: 'bg-red-100 text-red-800',
    ARCHIVED: 'bg-gray-100 text-gray-600',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export const ZIMBABWE_PROVINCES = [
  'Harare',
  'Bulawayo',
  'Manicaland',
  'Mashonaland Central',
  'Mashonaland East',
  'Mashonaland West',
  'Masvingo',
  'Matabeleland North',
  'Matabeleland South',
  'Midlands',
];

export const ZIMBABWE_CITIES: Record<string, string[]> = {
  'Harare': ['Harare', 'Chitungwiza', 'Epworth', 'Norton', 'Ruwa', 'Marondera'],
  'Bulawayo': ['Bulawayo', 'Entumbane', 'Emganwini', 'Nkulumane', 'Pumula'],
  'Manicaland': ['Mutare', 'Rusape', 'Chipinge', 'Chiredzi', 'Nyanga'],
  'Mashonaland Central': ['Bindura', 'Mazowe', 'Guruve', 'Mt Darwin', 'Centenary'],
  'Mashonaland East': ['Marondera', 'Chivhu', 'Murehwa', 'Goromonzi', 'Beatrice'],
  'Mashonaland West': ['Chinhoyi', 'Kariba', 'Chegutu', 'Kadoma', 'Karoi'],
  'Masvingo': ['Masvingo', 'Zvishavane', 'Mwenezi', 'Gutu', 'Bikita'],
  'Matabeleland North': ['Victoria Falls', 'Hwange', 'Lupane', 'Binga', 'Tsholotsho'],
  'Matabeleland South': ['Gwanda', 'Beitbridge', 'Plumtree', 'Filabusi'],
  'Midlands': ['Gweru', 'Kwekwe', 'Zvishavane', 'Shurugwi', 'Mvuma', 'Gokwe'],
};

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'ZiG', symbol: 'ZiG', name: 'Zimbabwe Gold' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
];

export const CATEGORIES_ICONS: Record<string, string> = {
  'Vehicles': '🚗',
  'Property': '🏠',
  'Phones & Electronics': '📱',
  'Computers': '💻',
  'Furniture': '🪑',
  'Home Appliances': '🔌',
  'Fashion': '👗',
  'Beauty': '💄',
  'Agriculture': '🌾',
  'Livestock': '🐄',
  'Machinery': '⚙️',
  'Mining Equipment': '⛏️',
  'Construction': '🏗️',
  'Industrial Equipment': '🏭',
  'Tools': '🔧',
  'Spare Parts': '🔩',
  'Jobs': '💼',
  'Services': '🤝',
  'Business Opportunities': '📈',
  'Books': '📚',
  'Sports': '⚽',
  'Baby & Kids': '🧸',
  'Food & Groceries': '🛒',
  'Musical Instruments': '🎵',
  'Pets': '🐾',
  'Other': '📦',
};

export function generateListingUrl(listing: { id: string; title: string; slug?: string }): string {
  const slug = listing.slug || slugify(listing.title);
  return `/listing/${listing.id}/${slug}`;
}