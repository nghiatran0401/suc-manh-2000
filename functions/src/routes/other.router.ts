import * as express from "express";
import { Response, Request } from "express";
import {firestore} from "../firebase";
import {FirebaseCollections} from "../constant";

const otherRouter = express.Router();

otherRouter.get("/", (req: Request, res: Response) => {
  res.send(`Server is running on ${process.env.CURRENT_ENV} now!!!`);
});

otherRouter.get("/data", async (req: Request, res: Response) => {
  // Generating 10 projects as dummy data with placeholder image
  const projects: Sucmanh2000.Project[] = [];
  for (let i = 1; i <= 10; i++) {
    const project: Sucmanh2000.Project = {
      author: `Author ${i}`,
      publish_date: Date.now().toString(),
      name: `Project ${i}`,
      slug: `project-${i}`,
      category: "2024",
      donor: {
        logos: [`https://placehold.co/50x50/000000/FFF`],
        description: `Donor Description for Project ${i}`,
      },
      progress: [
        {
          title: `Ảnh hiện trạng ${i}`,
          description: `Progress Description for Project ${i}`,
          images: [`https://placehold.co/600x400/000000/FFF`, `https://placehold.co/600x400/000000/FFF`],
        },
        {
          title: `Ảnh quá trình  ${i}`,
          description: `Progress Description for Project ${i}`,
          images: [`https://placehold.co/600x400/000000/FFF`, `https://placehold.co/600x400/000000/FFF`],
        },
        {
          title: `Ảnh hoàn thành  ${i}`,
          description: `Progress Description for Project ${i}`,
          images: [`https://placehold.co/600x400/000000/FFF`, `https://placehold.co/600x400/000000/FFF`],
        },
        
      ],
      body: {
        description: `Body Description for Project ${i}`,
        tabs: [
          {
            name: "Tab 1",
            content: {
              description: `Tab 1 Description for Project ${i}`,
              htmlContent: "<p>Sample HTML content for Tab 1</p>",
              embeded_url: "https://www.youtube.com/embed/3JZ_D3ELwOQ",
            },
          },
          {
            name: "Tab 2",
            content: {
              htmlContent: "<p>Sample HTML content for Tab 2</p>",
              description: `Tab 2 Description for Project ${i}`,
              slide_show: [
                {
                  image: `https://placehold.co/600x400/orange/white`,
                  caption: "Slide 1 caption",
                },
                {
                  image: `https://placehold.co/600x400/orange/white`,
                  caption: "Slide 2 caption",
                },
              ],
            },
          },
        ],
      },
    };
    projects.push(project);
  }

  // Generating 10 posts as dummy data with placeholder image
  const posts: Sucmanh2000.Post[] = [];

  for (let i = 1; i <= 10; i++) {
    const post: Sucmanh2000.Post = {
      author: `Author ${i}`,
      publish_date: Date.now().toString(),
      name: `Post ${i}`,
      slug: `post-${i}`,
      category: "News",
      body: {
        description: `Body Description for Post ${i}`,
        htmlContent: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit for Post ${i}</p>`,
        slide_show: [
          {
            image: `https://placehold.co/600x400/orange/white`,
            caption: "Slide 1 caption",
          },
          {
            image: `https://placehold.co/600x400/orange/white`,
            caption: "Slide 2 caption",
          },
        ],
      },
    };
    posts.push(post);
  }

  // Output generated projects and posts
  console.log("Generated Projects:");
  console.log("\nGenerated Posts:");
  // const docRef = firestore
  // .collection(FirebaseCollections.PROJECTS)
  // .doc();
  // docRef.set(projects[0]);
  // await Promise.all([
  //   ...(projects.map((project) => {
  //     return firestore.collection("projects").add(project);
  //   })),
  //   ...(posts.map((post) => {
  //     return firestore.collection("posts").add(post);
  //   }))
  // ])
  res.send({ projects, posts });
});

export default otherRouter;
