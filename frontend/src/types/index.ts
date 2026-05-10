export type Role = "USER" | "ADMIN";
export type TripStatus = "PLANNING" | "UPCOMING" | "ONGOING" | "COMPLETED";
export type Visibility = "PRIVATE" | "PUBLIC";
export type BudgetCategory = "TRANSPORT" | "FOOD" | "LODGING" | "ACTIVITIES" | "SHOPPING" | "MISCELLANEOUS";
export type ActivityCategory = "SIGHTSEEING" | "FOOD" | "ADVENTURE" | "SHOPPING" | "CULTURE";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  city?: string | null;
  country?: string | null;
  language?: string;
  preferences?: string[];
};

export type City = {
  id: string;
  name: string;
  country: string;
  region: string;
  costIndex: number;
  popularity: number;
  imageUrl: string;
  description: string;
  activities?: Activity[];
};

export type Activity = {
  id: string;
  cityId: string;
  title: string;
  category: ActivityCategory;
  description: string;
  durationMins: number;
  estimatedCost: number;
  city?: City;
};

export type StopActivity = {
  id: string;
  stopId: string;
  activityId?: string | null;
  title: string;
  description?: string | null;
  startTime?: string | null;
  durationMins: number;
  cost: number;
  order: number;
  activity?: Activity | null;
};

export type Stop = {
  id: string;
  tripId: string;
  cityId?: string | null;
  title: string;
  order: number;
  startDate: string;
  endDate: string;
  notes?: string | null;
  city?: City | null;
  activities: StopActivity[];
};

export type Budget = {
  id: string;
  tripId: string;
  category: BudgetCategory;
  planned: number;
};

export type Expense = {
  id: string;
  tripId: string;
  category: BudgetCategory;
  title: string;
  amount: number;
  spentAt: string;
  notes?: string | null;
};

export type ChecklistItem = {
  id: string;
  tripId: string;
  category: string;
  label: string;
  packed: boolean;
  order: number;
};

export type Note = {
  id: string;
  tripId: string;
  stopId?: string | null;
  title: string;
  body: string;
  updatedAt: string;
  stop?: Stop | null;
};

export type Trip = {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  startDate: string;
  endDate: string;
  visibility: Visibility;
  status: TripStatus;
  budgetTotal: number;
  currency: string;
  shareSlug?: string | null;
  stops: Stop[];
  budgets?: Budget[];
  checklist?: ChecklistItem[];
  notes?: Note[];
  expenses?: Expense[];
};

export type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};
