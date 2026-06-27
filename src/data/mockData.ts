export type IssueStatus = 'Reported' | 'Triaged' | 'Assigned' | 'In Progress' | 'Resolved';
export type IssueSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type IssueCategory = 'Roads' | 'Water' | 'Electricity' | 'Sanitation' | 'Parks & Rec' | 'Other';
export type UserRole = 'citizen' | 'authority' | null;

export interface AgentLog {
  step: string;
  output: string;
  confidence: number;
  timestamp: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  location: string;
  lat: number;
  lng: number;
  image: string;
  citizenId: string;
  citizenName: string;
  departmentId: string;
  upvotes: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  slaDeadline: string;
  trackingId: string;
  aiConfidence: number;
  agentLog: AgentLog[];
  isDuplicate?: boolean;
  duplicateOfId?: string;
  upvotedBy?: string[];
}

export interface Department {
  id: string;
  name: string;
  icon: string;
  color: string;
  openCount: number;
  resolvedCount: number;
  avgResolutionHours: number;
}

export interface User {
  id: string;
  name: string;
  role: 'citizen' | 'authority';
  ward?: string;
  points?: number;
  badges?: string[];
  reportsCount?: number;
  resolvedCount?: number;
  avatar?: string;
  rank?: number;
  trustScore?: number;
  phone?: string;
  employeeId?: string;
  departmentId?: string;
  verifiedReports?: number;
  falseAlarms?: number;
}

export const DEPARTMENTS: Department[] = [
  { id: 'roads', name: 'Roads', icon: 'road', color: '#F59E0B', openCount: 14, resolvedCount: 87, avgResolutionHours: 28 },
  { id: 'water', name: 'Water', icon: 'water_drop', color: '#3B82F6', openCount: 8, resolvedCount: 52, avgResolutionHours: 18 },
  { id: 'electricity', name: 'Electricity', icon: 'bolt', color: '#EAB308', openCount: 5, resolvedCount: 43, avgResolutionHours: 12 },
  { id: 'sanitation', name: 'Sanitation', icon: 'delete', color: '#10B981', openCount: 11, resolvedCount: 61, avgResolutionHours: 22 },
  { id: 'parks', name: 'Parks & Rec', icon: 'park', color: '#22C55E', openCount: 3, resolvedCount: 28, avgResolutionHours: 48 },
];

export const MOCK_ISSUES: Issue[] = [
  {
    id: '1',
    trackingId: 'CH-2024-001',
    title: 'Large Pothole on Main St',
    description: 'Dangerous pothole causing vehicles to swerve. About 30cm wide and 10cm deep. Causing traffic hazard especially at night.',
    category: 'Roads',
    severity: 'High',
    status: 'In Progress',
    location: '123 Main St, Central District',
    lat: 18.520,
    lng: 73.856,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDG0991LcH2QHsS68-rvtjMxf9AYQ7gRM3l1I0DyR-Ksd8_o0_LJ1hXABGEQW8IvdfhGbHNFPE2v7AsZ7A9Uw9vJgzONgA_KWkkCeo__AIAR_cxMAfx1YxohNWrFA0aqcWpRTGcrIPdADd2PXaMFnmhe80Kn3npciVPLP7tABS_MH1UGDk66i-NgEpu8h-7ZvW5HYzWsSgu69vgwmNz9rRCEAizcOzp5OsshMZ8WfYAmIVkmiKpQBrWcEZgjPPud3pegv4Dz2H31k3I',
    citizenId: 'u1',
    citizenName: 'Alex Mercer',
    departmentId: 'roads',
    upvotes: 24,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T09:10:00Z',
    slaDeadline: '2024-01-17T08:00:00Z',
    aiConfidence: 94,
    agentLog: [
      { step: 'Perceive', output: 'Image contains a large road surface depression with visible asphalt damage', confidence: 97, timestamp: '2024-01-15T08:00:05Z' },
      { step: 'Classify', output: 'Category: Roads | Severity: High | Type: Pothole', confidence: 94, timestamp: '2024-01-15T08:00:08Z' },
      { step: 'Deduplicate', output: 'No duplicate found within 200m radius for same issue type', confidence: 99, timestamp: '2024-01-15T08:00:12Z' },
      { step: 'Route', output: 'Assigned to Roads Department, West End Ward. Priority Rank: 2', confidence: 92, timestamp: '2024-01-15T08:00:15Z' },
      { step: 'Notify', output: 'Citizen notified. Roads Dept queue updated. ETA: 48h', confidence: 100, timestamp: '2024-01-15T08:00:18Z' },
    ]
  },
  {
    id: '2',
    trackingId: 'CH-2024-002',
    title: 'Fallen Branch on Sidewalk',
    description: 'Large tree branch blocking the entire sidewalk after last night\'s storm. Pedestrians are forced onto the road.',
    category: 'Parks & Rec',
    severity: 'Medium',
    status: 'Assigned',
    location: '45 Elm Avenue, West District',
    lat: 18.525,
    lng: 73.860,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJvq83HxMmxuuICG49tYGmLoJrMoD6YDxzg_CcElRclHp_1gR--upeKMWRSY9jtxFDJJEjN86najiatn2K4srt7lBIr14TFyvqM6LMja_SUScgHU_C2wz0aRFpm_54JmofocQLouksx5Cz9dI11a4wrPLsmEh7ZxBl4SqTy1x-xs2Dwsh6EzO4FS7KGWe7OEeaMZKmGvzzjHfq64llIvgV1YqRvXZJd3a1Y8KlF2MOhL0m0RQHCKZIBj5CetH-0_RTv1_yQyrKFonN',
    citizenId: 'u2',
    citizenName: 'Priya Sharma',
    departmentId: 'parks',
    upvotes: 8,
    createdAt: '2024-01-14T18:30:00Z',
    updatedAt: '2024-01-14T19:00:00Z',
    slaDeadline: '2024-01-16T18:30:00Z',
    aiConfidence: 91,
    agentLog: [
      { step: 'Perceive', output: 'Large organic debris (tree branch) obstructing pedestrian pathway', confidence: 95, timestamp: '2024-01-14T18:30:05Z' },
      { step: 'Classify', output: 'Category: Parks & Rec | Severity: Medium | Type: Obstruction', confidence: 91, timestamp: '2024-01-14T18:30:08Z' },
      { step: 'Deduplicate', output: 'No duplicate found', confidence: 99, timestamp: '2024-01-14T18:30:11Z' },
      { step: 'Route', output: 'Assigned to Parks & Rec Department. Priority Rank: 5', confidence: 88, timestamp: '2024-01-14T18:30:14Z' },
      { step: 'Notify', output: 'Citizen notified. Parks Dept queue updated.', confidence: 100, timestamp: '2024-01-14T18:30:16Z' },
    ]
  },
  {
    id: '3',
    trackingId: 'CH-2024-003',
    title: 'Major Water Main Leak',
    description: 'Large volume of water bubbling up through a crack in the sidewalk near the corner. Flooding the gutter and crosswalk. Water has been flowing for over 2 hours.',
    category: 'Water',
    severity: 'Critical',
    status: 'Assigned',
    location: '1240 West End Avenue, near 42nd St',
    lat: 18.515,
    lng: 73.850,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzS92Iytur2kCW630SoNoOYo95bSbwxKvH3cDoMCwp83sW4vLEUuD5Q26pdZNhZnSGJh42sPyRCKx8EWs5iCgOCF31YlTZQ9j7n0hOcWjD20EnNRP9DRBZzEx2FWEFky7P7id7NwK_tcUsJ9I9f53McK8inhTRZ8WZ8tOyYhoIzVH3oNeJEOj4nraH2McUe8Lq5zsvwiPsDlUfxSKuF6lhFLORoKFDa-XD-eKpzN7k4rXsG3cCjvnv4MkRNqiUvG24WYPAtTlA1yjQ',
    citizenId: 'u3',
    citizenName: 'Sarah J.',
    departmentId: 'water',
    upvotes: 31,
    createdAt: '2024-01-15T06:15:00Z',
    updatedAt: '2024-01-15T06:45:00Z',
    slaDeadline: '2024-01-15T14:15:00Z',
    aiConfidence: 98,
    agentLog: [
      { step: 'Perceive', output: 'Active water leak from subsurface pipe, flooding visible on pavement surface', confidence: 98, timestamp: '2024-01-15T06:15:04Z' },
      { step: 'Classify', output: 'Category: Water | Severity: CRITICAL | Type: Main Line Leak', confidence: 98, timestamp: '2024-01-15T06:15:07Z' },
      { step: 'Deduplicate', output: 'No duplicate found', confidence: 99, timestamp: '2024-01-15T06:15:10Z' },
      { step: 'Route', output: 'URGENT: Assigned to Water Division. Priority Rank: 1 (SLA: 8h)', confidence: 97, timestamp: '2024-01-15T06:15:13Z' },
      { step: 'Notify', output: 'Citizen notified. URGENT alert sent to Water Dept supervisor.', confidence: 100, timestamp: '2024-01-15T06:15:15Z' },
    ]
  },
  {
    id: '4',
    trackingId: 'CH-2024-004',
    title: 'Broken Streetlight at Intersection',
    description: 'Streetlight at the main intersection has been out for 3 days. Very dangerous at night — no visibility for pedestrians crossing.',
    category: 'Electricity',
    severity: 'High',
    status: 'Reported',
    location: '124 Maple Street, West End',
    lat: 18.522,
    lng: 73.858,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCt_GGqdd1GRdLhN4yFxbB71kBIyibqMjuCrOG9vTEDpK84PNvCxxaXaHVtnbJlov-P1UwyXfiWgwxGr4aqDAnlKSQyFkvhfJBnPCaBxPBhe-qGGreVSAiplJ_ovShO60iafCOmd_KBqEuFmWiBqYlv3FmJbB0TtN0QPp3vryKE_OAofCqPpm8se22Uo-FeTx4Glp_N_6ZPJNtKfRhMQsl6W7EaL5S2bG3Na9Nm0hiH-GVl-ID9e3T_1CP5-a50zuNqEO9Q7dkkCwTE',
    citizenId: 'u1',
    citizenName: 'Alex Mercer',
    departmentId: 'electricity',
    upvotes: 15,
    createdAt: '2024-01-13T20:00:00Z',
    updatedAt: '2024-01-13T20:10:00Z',
    slaDeadline: '2024-01-15T20:00:00Z',
    aiConfidence: 96,
    agentLog: [
      { step: 'Perceive', output: 'Non-functioning streetlight fixture detected. No illumination at night.', confidence: 96, timestamp: '2024-01-13T20:00:05Z' },
      { step: 'Classify', output: 'Category: Electricity | Severity: High | Type: Street Lighting Failure', confidence: 96, timestamp: '2024-01-13T20:00:08Z' },
      { step: 'Deduplicate', output: 'No duplicate found', confidence: 99, timestamp: '2024-01-13T20:00:11Z' },
      { step: 'Route', output: 'Assigned to Electricity Department. Priority Rank: 3', confidence: 94, timestamp: '2024-01-13T20:00:14Z' },
      { step: 'Notify', output: 'Citizen notified. Electricity Dept queue updated.', confidence: 100, timestamp: '2024-01-13T20:00:16Z' },
    ]
  },
  {
    id: '5',
    trackingId: 'CH-2024-005',
    title: 'Overflowing Garbage Bin',
    description: 'The public bin near the park entrance has been overflowing for 2 days. Garbage is spilling onto the footpath and attracting animals.',
    category: 'Sanitation',
    severity: 'Medium',
    status: 'Resolved',
    location: 'City Park Gate 2, North Side',
    lat: 18.530,
    lng: 73.865,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDog8b2wPLB6QLqgyjUEp9fkY2YUbUp7nVpK_Tksq4WsfCkDylHipJvt0038j89YxLiZf8WdTtQsqJiht379UigRYvt8ZmlHeZ_WKy8Q_QMYDBur-XJMtoj_ZLRLujBe8lPbUohHdvnArkM-XNsSLe2W5Jfx-ZX9AMpKAiPX4ICFXarU5XWfMCqPp1FqTI_0dEbbv4sG-n1-cdXtw4nBLwHvduoZaMquSYZ1qGum1cpsPeX9pNCdlng_-pJmIORFzy0S0JU3GhxdLPS',
    citizenId: 'u4',
    citizenName: 'Riya Desai',
    departmentId: 'sanitation',
    upvotes: 6,
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-13T14:00:00Z',
    resolvedAt: '2024-01-13T14:00:00Z',
    slaDeadline: '2024-01-14T10:00:00Z',
    aiConfidence: 89,
    agentLog: [
      { step: 'Perceive', output: 'Overflowing waste container with debris on surrounding ground', confidence: 92, timestamp: '2024-01-12T10:00:05Z' },
      { step: 'Classify', output: 'Category: Sanitation | Severity: Medium | Type: Waste Overflow', confidence: 89, timestamp: '2024-01-12T10:00:08Z' },
      { step: 'Deduplicate', output: 'No duplicate found', confidence: 99, timestamp: '2024-01-12T10:00:11Z' },
      { step: 'Route', output: 'Assigned to Sanitation Department. Priority Rank: 6', confidence: 90, timestamp: '2024-01-12T10:00:13Z' },
      { step: 'Notify', output: 'Citizen notified. Sanitation Dept queue updated.', confidence: 100, timestamp: '2024-01-12T10:00:15Z' },
    ]
  },
];

export const LEADERBOARD: User[] = [
  { id: 'u4', name: 'Riya Desai', role: 'citizen', ward: 'West End', points: 780, badges: ['Road Warrior', 'First Responder', 'Community Champion'], reportsCount: 18, resolvedCount: 16, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxYjGHh41gHFFmyV3-hhJ0l9q4SM4s4p7KS3him0HivZwW7vAv0gg4Hk9rF49YI4Jo9wmhSZs-eCnff1bLnE0xfFgeT5zVg7-aLtu8AIXU4tWlhbw5hLpfYLhXYNE1oR2M0rmHMipWJesSL78zSWYmPVL6mtlRU5L-Hq6SAMnxk9u1rJWrzs0HGYfEpwpBMQQQnr5BXohipuA9z_niwwruu2CPuda46t_adcWb63ommuheg4qCvWtSeOTkCP1dJe0giHBEAJgioT6U', rank: 1, trustScore: 99, verifiedReports: 16, falseAlarms: 0 },
  { id: 'u2', name: 'Priya Sharma', role: 'citizen', ward: 'West End', points: 620, badges: ['First Responder', 'Road Warrior'], reportsCount: 14, resolvedCount: 12, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxYjGHh41gHFFmyV3-hhJ0l9q4SM4s4p7KS3him0HivZwW7vAv0gg4Hk9rF49YI4Jo9wmhSZs-eCnff1bLnE0xfFgeT5zVg7-aLtu8AIXU4tWlhbw5hLpfYLhXYNE1oR2M0rmHMipWJesSL78zSWYmPVL6mtlRU5L-Hq6SAMnxk9u1rJWrzs0HGYfEpwpBMQQQnr5BXohipuA9z_niwwruu2CPuda46t_adcWb63ommuheg4qCvWtSeOTkCP1dJe0giHBEAJgioT6U', rank: 2, trustScore: 94, verifiedReports: 12, falseAlarms: 1 },
  { id: 'u1', name: 'Alex Mercer', role: 'citizen', ward: 'West End', points: 450, badges: ['Road Warrior', 'First Responder'], reportsCount: 10, resolvedCount: 8, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxYjGHh41gHFFmyV3-hhJ0l9q4SM4s4p7KS3him0HivZwW7vAv0gg4Hk9rF49YI4Jo9wmhSZs-eCnff1bLnE0xfFgeT5zVg7-aLtu8AIXU4tWlhbw5hLpfYLhXYNE1oR2M0rmHMipWJesSL78zSWYmPVL6mtlRU5L-Hq6SAMnxk9u1rJWrzs0HGYfEpwpBMQQQnr5BXohipuA9z_niwwruu2CPuda46t_adcWb63ommuheg4qCvWtSeOTkCP1dJe0giHBEAJgioT6U', rank: 3, trustScore: 98, verifiedReports: 8, falseAlarms: 0 },
  { id: 'u3', name: 'Sarah J.', role: 'citizen', ward: 'West End', points: 310, badges: ['First Responder'], reportsCount: 7, resolvedCount: 5, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxYjGHh41gHFFmyV3-hhJ0l9q4SM4s4p7KS3him0HivZwW7vAv0gg4Hk9rF49YI4Jo9wmhSZs-eCnff1bLnE0xfFgeT5zVg7-aLtu8AIXU4tWlhbw5hLpfYLhXYNE1oR2M0rmHMipWJesSL78zSWYmPVL6mtlRU5L-Hq6SAMnxk9u1rJWrzs0HGYfEpwpBMQQQnr5BXohipuA9z_niwwruu2CPuda46t_adcWb63ommuheg4qCvWtSeOTkCP1dJe0giHBEAJgioT6U', rank: 4, trustScore: 82, verifiedReports: 5, falseAlarms: 2 },
];

export const CURRENT_USER: User = LEADERBOARD[2]; // Alex Mercer

export const PLATFORM_STATS = {
  totalResolved: 271,
  totalReported: 318,
  avgResolutionHours: 22,
  wardsActive: 8,
  aiAccuracy: 94,
};
