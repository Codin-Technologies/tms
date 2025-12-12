export interface Tyre {
  id: string;
  serialNumber: string;
  brand: string;
  model: string;
  size: string;
  type: 'Truck' | 'Bus' | 'Spare';
  status: 'In Stock' | 'Mounted' | 'In Maintenance' | 'Disposed';
  location: string;
  purchaseDate: string;
  lastInspectionDate: string;
  treadDepth: number; // in mm
  pressure: number; // in PSI
  mileage: number;
  price: number;
}

export interface TyreStock {
  timestamp: Date;
  message:   string;
  data:      TyreDetails[];
}

export interface TyreDetails {
  id:               number;
  serialNumber:     string;
  brand:            string;
  model:            string;
  size:             string;
  type:             string;
  plyRating:        string;
  purchaseDate:     Date;
  purchaseCost:     number;
  totalKm:          number;
  remainingTreadMm: number;
  condition:        string;
  status:           string;
  createdAt:        Date;
  updatedAt:        null;
}

export interface StockOverview {
  timestamp: Date;
  message:   string;
  data:      Data;
}

export interface Data {
  total:            string;
  inuse:            string;
  instore:          string;
  needsreplacement: string;
}

export interface InspectionOverview {
  timestamp: Date;
  message:   string;
  data:      OverviewData;
}

export interface OverviewData {
  totalInspections:  TotalInspections;
  failedInspections: FailedInspections;
  passRate:          FailedInspections;
  pendingReviews:    PendingReviews;
}

export interface FailedInspections {
  value:     number;
  change:    number;
  direction: string;
}

export interface PendingReviews {
  value:  string;
  status: string;
}

export interface TotalInspections {
  value:       number;
  monthGrowth: number;
}
