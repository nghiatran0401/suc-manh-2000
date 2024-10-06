import { Timestamp } from "firebase-admin";

export type NewsPost = {
  id: string; // Firestore doc id
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
  id: string; // Firestore doc id
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
  totalFund: number;
  location: Location;
  description?: string; // temporary
  donor?: any; // temporary
  contentNew?: any; // temporary - 2024 only
  progressNew?: any; // temporary - 2024 only
  donors?: Donors; // temporary optional
  metadata?: Metadata; // temporary optional
  progress: Progress;
  content: {
    tabs: TabsContent;
  };
};

type Location = {
  province: string;
  district?: string;
  commune?: string;
  distanceToHCMC?: number;
  distanceToHN?: number;
};

type Metadata = {
  constructionItems?: string;
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

type Donors = {
  name: string;
  totalProjects: number;
  intro?: string;
  logo?: string;
  notes?: string;
  contact?: string;
}[];

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
  slide_show: {
    image: string;
    caption: string;
  }[];
}[];
