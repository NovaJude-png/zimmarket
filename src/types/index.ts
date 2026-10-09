// ZimMarket Type Definitions

export type AccountType = 'BUYER' | 'INDIVIDUAL_SELLER' | 'BUSINESS_SELLER' | 'ADMIN';

export type ListingStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'SOLD' | 'EXPIRED' | 'REJECTED' | 'ARCHIVED';

export type ListingCondition = 'NEW' | 'LIKE_NEW' | 'USED_EXCELLENT' | 'USED_GOOD' | 'USED_FAIR' | 'FOR_PARTS' | 'REFURBISHED';

export type ReportReason = 'FAKE_LISTING' | 'SCAM' | 'COUNTERFEIT' | 'STOLEN' | 'HARASSMENT' | 'SPAM' | 'PROHIBITED' | 'FAKE_SELLER' | 'MISLEADING' | 'SUSPICIOUS_PAYMENT' | 'OTHER';

export type ReportStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'ACTION_TAKEN' | 'DISMISSED' | 'ESCALATED';

export type PromotionType = 'BOOST' | 'FEATURED' | 'CATEGORY_FEATURED' | 'SEARCH_PRIORITY' | 'LOCATION_FEATURED';

export type PaymentStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  subcategoryId?: string;
  location?: string;
  province?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ListingCondition;
  isNegotiable?: boolean;
  deliveryAvailable?: boolean;
  verifiedOnly?: boolean;
  sortBy?: 'relevance' | 'newest' | 'oldest' | 'price_low' | 'price_high' | 'distance' | 'views' | 'rating';
  page?: number;
  limit?: number;
}

export interface ListingWithRelations {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  isNegotiable: boolean;
  condition: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  quantity: number;
  locationCity: string | null;
  locationProvince: string | null;
  locationArea: string | null;
  status: string;
  viewCount: number;
  favouriteCount: number;
  isFeatured: boolean;
  isPromoted: boolean;
  createdAt: Date;
  publishedAt: Date | null;
  images: { id: string; url: string; altText: string | null; sortOrder: number; isPrimary: boolean }[];
  seller: {
    id: string;
    profile: {
      displayName: string;
      username: string | null;
      avatarUrl: string | null;
      locationCity: string | null;
    } | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  };
  _count?: {
    reviews: number;
    favourites: number;
  };
}

export interface SellerProfile {
  id: string;
  displayName: string;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  locationCity: string | null;
  locationProvince: string | null;
  showPhone: boolean;
  showEmail: boolean;
}

export interface ConversationPreview {
  id: string;
  otherUser: {
    id: string;
    profile: {
      displayName: string;
      avatarUrl: string | null;
    } | null;
  };
  listing: {
    id: string;
    title: string;
    images: { url: string }[];
  } | null;
  lastMessage: string | null;
  lastMsgAt: Date | null;
  unreadCount: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  activeListings: number;
  newListingsToday: number;
  totalSold: number;
  totalMessages: number;
  totalReports: number;
  pendingReports: number;
  totalRevenue: number;
  activeSubscriptions: number;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  isVerified: boolean;
  createdAt: Date;
  author: {
    id: string;
    profile: {
      displayName: string;
      avatarUrl: string | null;
    } | null;
  };
}

export interface SubscriptionPlanItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  duration: number;
  maxListings: number;
  maxImages: number;
  boostCredits: number;
  features: string;
  isActive: boolean;
  sortOrder: number;
}

export interface AdCampaignItem {
  id: string;
  name: string;
  campaignType: string;
  budget: number;
  dailyBudget: number | null;
  spent: number;
  startDate: Date;
  endDate: Date;
  status: string;
  impressions: number;
  clicks: number;
  conversions: number;
  creativeTitle: string | null;
  creativeText: string | null;
  creativeImage: string | null;
}