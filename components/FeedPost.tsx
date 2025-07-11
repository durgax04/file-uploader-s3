import Image from "next/image";
import Link from "next/link";
import { Prisma, Media } from "@prisma/client";
import { redirect } from "next/navigation";

type PostWithUser = Prisma.PostGetPayload<{
  include: { user: true };
}>;

interface FeedPostProps {
  post: PostWithUser;
  user: {
    id: string;
    name?: string | null;
    image?: string | null;
  };
  media: Media[]; // <-- proper typing instead of []
}

const FeedPost = ({ post, user, media }: FeedPostProps) => {

    if (!user) {
       return redirect("/");
    }

  const userMedia = media.find((m) => m.type === "image");
  console.log(userMedia);

  return (
    <article className="flex flex-col gap-4 py-4 px-4 border border-neutral-700 my-4 mx-4">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Link href={`/${post.user.id}`}>
          <div className="w-10 h-10 rounded-full overflow-hidden relative">
            <Image
              src={user.image!}
              alt={user.name || "User"}
              fill
              sizes="32"
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
            <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
          </div>

          <p className="text-sm">{post.content}</p>

          {/* Render media if any */}
          {userMedia && (
            <>
              {userMedia.type === "image" && (
                <Image
                  src={userMedia.url}
                  alt="Post media"
                  width={400}
                  height={400}
                  className="rounded-lg object-cover"
                />
              )}
              {/* {userMedia.type === "video" && (
                <video
                  src={userMedia.url}
                  controls
                  className="rounded-lg object-cover max-w-full"
                />
              )} */}
            </>
          )}
        </div>
      </div>
    </article>
  );
};

export default FeedPost;
