declare namespace Sucmanh2000 {
  type Post = {
    id: number;
    name: string;
    author: string;
    publish_date: string;
    slug: string;
    description?: string;
    thumbnail: string;
    category?: string;
    classification?: string;
    status?: string;
    totalFund?: number;
    location?: {
      province?: string;
      district?: string;
      commune?: string;
      distanceToHCMC?: number;
      distanceToHN?: number;
    };
    metadata?: {
      stage?: string;
      totalStudents?: number;
      totalClassrooms?: number;
      totalRooms?: number;
      totalKitchens?: number;
      totalToilets?: number;
      progress?: string;
      start_date?: string;
      end_date?: string;
    };
    donor?: Donor;
    donors?: string[];
    progress?: Progress;
    content: {
      tabs: TabsContent;
    };
  };

  type Donor = {
    description: string;
    images: {
      image: string;
      caption?: string;
    }[];
  };

  type Progress = {
    name: string;
    images: {
      image: string;
      caption?: string;
    }[];
  }[];

  type TabsContent = {
    name: string;
    description: string;
    embedded_url?: string;
    slide_show?: {
      image: string;
      caption?: string;
    }[];
  }[];
}
