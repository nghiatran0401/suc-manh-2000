declare namespace Sucmanh2000 {
  type PostInfor = {
    author: string;
    publish_date: string;
    name: string;
    slug: string;
    category: string;
  };

  type ContentModule = {
    description?: string;
    htmlContent?: string;
    embeded_url?: string;
    slide_show?: {
      image: string;
      caption?: string;
    }[];
  };

  type Project = PostInfor & {
    donor?: {
      logos?: string[];
      description: string;
    };
    progress: {
      title: string;
      description: string;
      images: string[];
    }[];
    body?: {
      description?: string;
      tabs?: {
        name: string;
        content: ContentModule;
      }[];
    };
  };

  type Post = PostInfor & {
    body?: ContentModule;
  };
}
