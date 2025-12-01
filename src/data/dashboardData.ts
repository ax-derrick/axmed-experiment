// Mock data for Dashboard components

// ============ SHARED DATA ============

export const userData = {
  name: 'Derrick',
  organization: 'Cipla Pharmaceuticals',
  supplierScore: 85,
  scoreChange: 5,
  activeBids: 12,
  availableOpportunities: 17,
  status: 'Trusted Partner',
};

// ============ CONCEPT A: PROCUREMENT JOURNEY ============

export interface JourneyStep {
  key: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  cta?: string;
  icon?: string;
}

export const journeySteps: JourneyStep[] = [
  {
    key: 'setup',
    title: 'Setup Profile',
    description: 'Complete your profile and documents',
    status: 'completed',
    cta: 'Complete Setup',
    icon: 'UserOutlined',
  },
  {
    key: 'bid',
    title: 'Bid on Tenders',
    description: 'Browse and bid on opportunities',
    status: 'completed',
    cta: 'Find Tenders',
    icon: 'FileTextOutlined',
  },
  {
    key: 'win',
    title: 'Win Bid',
    description: 'Get awarded and finalize terms',
    status: 'completed',
    cta: 'View Contracts',
    icon: 'TrophyOutlined',
  },
  {
    key: 'deliver',
    title: 'Deliver',
    description: 'Fulfill orders and build reputation',
    status: 'current',
    cta: 'Manage Orders',
    icon: 'RocketOutlined',
  },
];

export interface AttentionItem {
  id: number;
  type: 'urgent' | 'pending' | 'info';
  icon: string;
  title: string;
  description: string;
  link: string;
  actionLabel: string;
}

export const attentionItems: AttentionItem[] = [
  {
    id: 1,
    type: 'urgent',
    icon: 'FireOutlined',
    title: '2 tenders closing in 48h',
    description: 'Don\'t miss these opportunities',
    link: '/tenders',
    actionLabel: 'View Tenders',
  },
  {
    id: 2,
    type: 'pending',
    icon: 'FileTextOutlined',
    title: '3 bids pending response',
    description: 'Awaiting buyer decision',
    link: '/my-bids',
    actionLabel: 'Check Status',
  },
  {
    id: 3,
    type: 'info',
    icon: 'TrophyOutlined',
    title: '1 new contract awarded',
    description: 'Congratulations!',
    link: '/my-bids',
    actionLabel: 'View Details',
  },
];

// ============ CONCEPT B: ACTION CARDS (TRELLO-STYLE) ============

export interface UpNextItem {
  id: number;
  type: 'hot' | 'pending' | 'action';
  badge?: string;
  title: string;
  subtitle: string;
  meta: string;
  value?: string;
  link: string;
  dismissable: boolean;
}

export const upNextItems: UpNextItem[] = [
  {
    id: 1,
    type: 'hot',
    badge: '🔥 Hot Opportunity',
    title: 'Maternal Health Kit Tender',
    subtitle: 'Closing Dec 5, 2025',
    meta: 'Est. value: $125,000',
    link: '/tenders/234',
    dismissable: true,
  },
  {
    id: 2,
    type: 'pending',
    badge: '📝 Pending Response',
    title: 'Bid #445 - Oxytocin Injectable',
    subtitle: 'Submitted 3 days ago',
    meta: 'Quantity: 50,000 units',
    link: '/my-bids/445',
    dismissable: false,
  },
  {
    id: 3,
    type: 'action',
    badge: '📋 Action Required',
    title: 'Complete product documentation',
    subtitle: 'For Amoxicillin 500mg',
    meta: 'Required for 2 active bids',
    link: '/portfolio',
    dismissable: true,
  },
];

export interface RecentItem {
  id: number;
  title: string;
  type: string;
  link: string;
}

export const recentlyViewed: RecentItem[] = [
  { id: 1, title: 'Amoxicillin Tender #234', type: 'tender', link: '/tenders/234' },
  { id: 2, title: 'Cipla Q3 Portfolio', type: 'portfolio', link: '/portfolio' },
  { id: 3, title: 'Bid #892 - Pending', type: 'bid', link: '/my-bids/892' },
  { id: 4, title: 'Nigeria Market Report', type: 'insight', link: '/insights' },
];

export interface QuickAction {
  key: string;
  label: string;
  icon: string;
  link: string;
}

export const quickActions: QuickAction[] = [
  { key: 'manage-bids', label: 'Manage Bids', icon: 'FileTextOutlined', link: '/my-bids' },
  { key: 'upload', label: 'Upload Products', icon: 'UploadOutlined', link: '/portfolio' },
  { key: 'analytics', label: 'View Analytics', icon: 'BarChartOutlined', link: '/analytics' },
];

export const statsB = {
  winRate: 68,
  winRateTrend: 'up',
  activeBids: 12,
};

// ============ CONCEPT C: GAMIFICATION (CONTRA-STYLE) ============

export interface OpportunityCategory {
  id: number;
  icon: string;
  name: string;
  matchingTenders: number;
  link: string;
}

export const opportunityCategories: OpportunityCategory[] = [
  {
    id: 1,
    icon: 'MedicineBoxOutlined',
    name: 'Maternal Health',
    matchingTenders: 9,
    link: '/tenders?category=maternal-health',
  },
  {
    id: 2,
    icon: 'HeartOutlined',
    name: 'Essential Medicines',
    matchingTenders: 5,
    link: '/tenders?category=essential-medicines',
  },
  {
    id: 3,
    icon: 'ExperimentOutlined',
    name: 'Vaccines & Immunization',
    matchingTenders: 3,
    link: '/tenders?category=vaccines',
  },
];

export interface TrendingProduct {
  id: number;
  name: string;
  demandChange: number;
  trend: 'up' | 'down';
}

export const trendingProducts: TrendingProduct[] = [
  { id: 1, name: 'Amoxicillin', demandChange: 23, trend: 'up' },
  { id: 2, name: 'Oxytocin', demandChange: 15, trend: 'up' },
  { id: 3, name: 'Misoprostol', demandChange: 12, trend: 'up' },
  { id: 4, name: 'Magnesium Sulfate', demandChange: 8, trend: 'up' },
];

// ============ AVAILABLE OPPORTUNITIES (RFQs) ============

export interface AvailableOpportunity {
  id: number;
  medication: string;
  form: string;
  countries: string[];
  daysUntilClose: number;
  inPortfolio: boolean;
  hasActiveBid: boolean;
  badge?: 'first_to_bid' | 'suppliers_active';
  suppliersActive?: number;
  // Tender details
  tenderNo: string;
  tenderDescription: string;
  totalVolume: string;
  maxTender: string;
}

export const availableOpportunities: AvailableOpportunity[] = [
  {
    id: 1,
    medication: 'Amoxicilin',
    form: 'Tablet, 250mg',
    countries: ['Ethiopia', 'Ghana', 'Kenya', 'Uganda', 'Vietnam'],
    daysUntilClose: 21,
    inPortfolio: false,
    hasActiveBid: false,
    badge: 'first_to_bid',
    tenderNo: 'Tender 211',
    tenderDescription: 'International Organization: multi-country tender for essential medicines',
    totalVolume: '100,600 tablets',
    maxTender: '1,000,000 tablets',
  },
  {
    id: 2,
    medication: 'Enapril',
    form: 'Injectable Solution, 1.25Mg/1Ml',
    countries: ['Nigeria', 'Kenya', 'Ethiopia', 'Ghana'],
    daysUntilClose: 1,
    inPortfolio: true,
    hasActiveBid: true,
    tenderNo: 'Tender 198',
    tenderDescription: 'Regional Health Ministry: cardiovascular medication supply',
    totalVolume: '50,000 vials',
    maxTender: '200,000 vials',
  },
  {
    id: 3,
    medication: 'Aceclofenac / Paracetamol',
    form: 'Tablet, 250mg',
    countries: ['Nigeria', 'Kenya', 'Malawi'],
    daysUntilClose: 14,
    inPortfolio: true,
    hasActiveBid: true,
    tenderNo: 'Tender 245',
    tenderDescription: 'Public Hospital Network: pain management supplies',
    totalVolume: '250,000 tablets',
    maxTender: '500,000 tablets',
  },
  {
    id: 4,
    medication: 'Calibrated drape',
    form: 'Sterile sheet',
    countries: ['Nigeria', 'Kenya', 'Malawi'],
    daysUntilClose: 15,
    inPortfolio: false,
    hasActiveBid: false,
    tenderNo: 'Tender 302',
    tenderDescription: 'Maternal Health Initiative: delivery room supplies',
    totalVolume: '15,000 units',
    maxTender: '50,000 units',
  },
  {
    id: 5,
    medication: 'Amoxicilin',
    form: 'Tablet, 250mg',
    countries: ['Nigeria', 'Kenya', 'Malawi'],
    daysUntilClose: 1,
    inPortfolio: false,
    hasActiveBid: false,
    badge: 'suppliers_active',
    suppliersActive: 3,
    tenderNo: 'Tender 289',
    tenderDescription: 'NGO Consortium: antibiotic procurement program',
    totalVolume: '75,000 tablets',
    maxTender: '300,000 tablets',
  },
];

// ============ LEGACY DATA (keeping for compatibility) ============

export interface ActivityItem {
  id: number;
  type: 'pending_bid' | 'closing_soon' | 'award' | 'notification';
  label: string;
  icon: string;
  link?: string;
}

export interface QuickstartItem {
  key: string;
  label: string;
  description: string;
  path: string;
  count?: number;
  comingSoon?: boolean;
}

export const activityItems: ActivityItem[] = [
  {
    id: 1,
    type: 'pending_bid',
    label: '3 pending bids awaiting response',
    icon: 'FileTextOutlined',
    link: '/my-bids'
  },
  {
    id: 2,
    type: 'closing_soon',
    label: '2 tenders closing this week',
    icon: 'ClockCircleOutlined',
    link: '/tenders'
  },
  {
    id: 3,
    type: 'award',
    label: '1 new contract awarded',
    icon: 'TrophyOutlined',
    link: '/my-bids'
  },
];

export const quickstartItems: QuickstartItem[] = [
  {
    key: 'tenders',
    label: 'Open Tenders',
    description: 'Browse and bid on available tenders',
    path: '/tenders',
    count: 9
  },
  {
    key: 'portfolio',
    label: 'Portfolio',
    description: 'Manage your product catalog',
    path: '/portfolio'
  },
  {
    key: 'insights',
    label: 'Insights',
    description: 'Market intelligence and analytics',
    path: '/insights',
    comingSoon: true
  },
];
