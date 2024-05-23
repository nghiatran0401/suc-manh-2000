export const getNews = () => {
  return {
    author: "user_id",
    publish_date: "date",
    name: "News name",
    slug: "news-slug",
    category: "tin-tuc",
    content: {
      tabs: [
        {
          name: "Main content",
          description: "html/markdown description",
          embedded_url: "https://www.youtube.com/embed/1",
          slide_show: [
            {
              image: "image1",
              caption: "caption1",
            },
            {
              image: "image2",
              caption: "caption2",
            },
            {
              image: "image3",
              caption: "caption3",
            },
          ],
        },
      ],
    },
  };
};
