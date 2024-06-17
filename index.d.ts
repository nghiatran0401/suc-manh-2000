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
    totalFund?: number;
    status?: string;
    donor?: Donor;
    progress?: Progress;
    content: {
      tabs: TabsContent;
    };
    // metadata: {
    //   totalStudents: number,
    //   totalMoney: number,
    //   totalRooms: number,
    // }
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
