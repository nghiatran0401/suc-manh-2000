import { Timestamp } from "firebase-admin";

export type NewsPost = {
  id: string;
  name: string;
  author: string;
  slug: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  thumbnail: string;
  category: string;
  content: {
    tabs: TabsContent;
  };
};

export type ProjectPost = {
  id: string;
  projectId: string;
  name: string;
  author: string;
  slug: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  thumbnail: string;
  category: string;
  classification: string;
  status: string;
  subStatus?: string;
  totalFund: number;
  location: Location;
  donors: {
    donorId?: string;
    donationId?: string;
  }[];
  contentNew?: any; // temporary - 2024 only
  progressNew?: any; // temporary - 2024 only
  metadata: Metadata;
  progress: Progress;
  content: {
    tabs: TabsContent;
  };
};

export type Donor = {
  id: string;
  name: string;
  intro?: string;
  logo?: string;
  type?: string;
  employeeCount?: string;
};

export type Donation = {
  id: string;
  donorId: string;
  projectId: string;
  amount: number;
};

type Location = {
  province: string;
  district: string;
  commune: string;
  distanceToHCMC?: number;
  distanceToHN?: number;
};

type Metadata = {
  constructionItems?: string;
  constructionUnit?: string;
  type?: string;
  stage?: string;
  totalStudents?: string;
  totalClassrooms?: string;
  totalPublicAffairsRooms?: string;
  totalRooms?: string;
  totalKitchens?: string;
  totalToilets?: string;
  start_date?: string;
  end_date?: string;
};

type Progress = {
  name: string;
  images: {
    image: string;
    caption: string;
  }[];
}[];

type TabsContent = {
  name: string;
  description: string;
  slide_show?: {
    image: string;
    caption: string;
  }[];
}[];
