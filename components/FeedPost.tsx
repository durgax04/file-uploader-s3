

import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { getUserSession } from "@/lib/session";
import { redirect } from "next/navigation";

type PostWithUserAndMedia = Prisma.PostGetPayload<{
  include: {
    user: true;
    media: true;
  };
}>;


interface FeedPostProps {
  post: PostWithUserAndMedia;
}

const FeedPost = async ({ post }: FeedPostProps) => {

  const user = await getUserSession();
  if (!user) {
    redirect("/");
  }

  console.log(post.media);

  return (
    <article className="flex flex-col gap-4 py-4 px-4 border border-neutral-700 my-4 mx-4">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Link href={`/${post.user.id}`}>
          <div className="w-10 h-10 rounded-full overflow-hidden relative">
            <Image
              src={user.image!}
              alt={user.name!}
              fill
              className="object-cover"
            />
          </div>
        </Link>

        {/* Post Content */}
        <div className="flex flex-col gap-1 w-full">
          <div className="flex justify-between">
            <Link href={`/${post.user.id}`}>
              <p className="font-semibold">{post.user.name}</p>
            </Link>
            <p className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>

          <p className="text-sm">{post.content}</p>

          {/* Media Display */}
          {post.media.map((mediaItem) =>
            mediaItem.type === "image" ? (
              <Image
                key={mediaItem.id}
                src={mediaItem.url!}
                alt="Post media"
                width={400}
                height={400}
                className="rounded-lg object-cover"
              />
            ) : mediaItem.type === "video" ? (
              <video
                key={mediaItem.id}
                src={mediaItem.url}
                controls
                className="rounded-lg max-w-full"
              />
            ) : null
          )}
        </div>
      </div>
    </article>
  );
};

export default FeedPost;
