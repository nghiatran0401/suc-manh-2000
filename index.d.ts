declare namespace Sucmanh2000 {
  type PostInfor = {
    author: string;
    publish_date: string;
    name: string;
    slug: string;
    category: string;
    description?: string;
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
