declare namespace Sucmanh2000 {
  type Post = {
    author: string;
    publish_date: string;
    name: string;
    slug: string;
    category: string;
    description?: string;
    classification?: string;
  };

  type Donor = {
    name: string;
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

  type Project = Post & {
    donor: Donor;
    progress: Progress;
    content: {
      tabs: TabsContent;
    };
  };

  type News = Post & {
    content: {
      tabs: TabsContent;
    };
  };
}
