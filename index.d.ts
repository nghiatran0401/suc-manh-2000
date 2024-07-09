declare namespace Sucmanh2000 {
  type Post = {
    id: number;
    name: string;
    author: string;
    publish_date: string;
    slug: string;
    thumbnail: string;
    category?: string;
    classification?: string;
    status?: string;
    totalFund?: number;
    start_date?: string;
    end_date?: string;
    description?: string;
    donor?: Donor;
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
