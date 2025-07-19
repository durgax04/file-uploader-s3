import FeedPost from "@/components/FeedPost";
import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/lib/session";
import { redirect } from "next/navigation";
import type { Post, User, Media } from "@prisma/client";

// Custom post type that includes related data
type FullPost = Post & {
  user: User;
  media: Media[];
};

const Posts = async () => {
  const user = await getUserSession();

  if (!user) {
    redirect("/");
  }

  const posts: FullPost[] = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      media: true,
    },
  });

  return (
    <div className="flex flex-col divide-y">
      {posts.map((post) => (
        <FeedPost key={post.id} post={post} />
      ))}
    </div>
  );
};

export default Posts;
