"use client";

import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { Loader2, Trash } from "lucide-react";
import { deletePost } from "./actions/deleteAction";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";

type PostWithUserAndMedia = Prisma.PostGetPayload<{
  include: {
    user: true;
    media: true;
  };
}>;

interface FeedPostProps {
  post: PostWithUserAndMedia;
}

const FeedPost = ({ post }: FeedPostProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: session } = useSession();

  console.log("Post user image--->>", post.user.image);

  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    // const confirmed = window.confirm("Are you sure you want to delete this post.")

    // if (!confirmed) return;

    try {
      await deletePost(post.id);
      toast.message("Post successfully deleted");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete post.");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  // check owner to delete post
  const isOwner = session?.user?.id === post.user.id;

  /**/
  return (
    <article className="flex flex-col w-[400px] md:w-[550px] gap-4 py-4 px-4 border border-neutral-700 my-4 mx-4">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Link href={`/${post.user.id}`}>
          <div className="w-10 h-10 rounded-full overflow-hidden relative">
            <Image
              src={post.user.image!}
              alt={post.user.name!}
              fill
              className="object-cover"
            />
          </div>
        </Link>

        {/* Post Content */}
        <div className="flex flex-col gap-1 w-full">
          <div className="flex justify-between items-center">
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

          {/* Delete Button */}
          {isOwner && (
            <div className="mt-2">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`text-gray-400 hover:text-gray-500 transition ${
                  isDeleting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isDeleting ? (
                  <span className="text-sm animate-pulse flex items-center">
                    Deleting...
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </span>
                ) : (
                  <Trash size={24} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default FeedPost;
