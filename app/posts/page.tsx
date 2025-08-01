import FeedPost from "@/components/FeedPost";
import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

// Define the type for post with user and media included
type PostWithUserAndMedia = Prisma.PostGetPayload<{
  include: {
    user: true;
    media: true;
  };
}>;

const Posts = async () => {
  const user = await getUserSession();

  if (!user) {
    redirect("/");
  }

  const posts: PostWithUserAndMedia[] = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      media: true,
    },
  });

  return (
    <div className="flex flex-col justify-center items-center divide-y">
      {posts.length === 0 ? (
        <p className="text-gray-400 mt-10 text-center text-sm flex flex-col items-center">
          <span className="text-3xl">📭</span>
          <span>No posts yet</span>
        </p>
      ) : (
        posts.map((post) => (
          <FeedPost key={post.id} post={post} />
        ))
      )}
    </div>
  );
};

export default Posts;
