declare namespace Sucmanh2000 {
  type Post = {
    id: number;
    author: string;
    publish_date: string;
    name: string;
    slug: string;
    category: string;
    description?: string;
    classification?: string;
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
