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
    <div className="flex flex-col h-screen justify-center items-center divide-y">
      {posts.map((post) => (
        <FeedPost key={post.id} post={post} currUser={user} currUserImage={user.image!}/>
      ))}
    </div>
  );
};

export default Posts;
