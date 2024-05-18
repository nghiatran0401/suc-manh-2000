export const getProject = () => {
  return {
    author: "user_id",
    publish_date: "date",
    name: "Project name",
    description: "html/markdown description",
    slug: "project-slug",
    category: "du-an-2024",
    donor: {
      name: "Donor name",
      description: "html/markdown description",
      images: ["image1"],
    },
    progress: [
      {
        name: "Ảnh hiện trạng",
        description: "html/markdown description",
        images: ["progress image"],
      },
      {
        name: "Ảnh tiến độ",
        description: "html/markdown description",
        images: ["progress image"],
      },
      {
        name: "Ảnh hoàn thiện",
        description: "html/markdown description",
        images: ["progress image"],
      },
    ],
    content: {
      tabs: [
        {
          name: "Hoàn cảnh",
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
        {
          name: "Nhà hảo tâm",
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
        {
          name: "Mô hình xây",
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
