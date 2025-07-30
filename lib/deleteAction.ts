"use server";

import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { prisma } from "./prisma";
import { getUserSession } from "./session";

const s3Client = new S3Client({
    region: process.env.AWS_BUCKET_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
});

export async function deletePost(postId: string) {

    const user = await getUserSession();

    if (!user) {
        throw new Error("Unauthorized");
    }

    try {
        // get post the del
        const post = await prisma.post.findUnique({
            where: {
                id: postId
            },
            include: {
                media: true
            }
        });

        if (!post) {
            throw new Error("Post not found");
        }

        if (post.userId !== user.id) {
            throw new Error("Forbidden");
        }

        // delete from s3
        for (const media of post.media) {
            const key = new URL(media.url).pathname.slice(1);
            await s3Client.send(
                new DeleteObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: key
                })
            )
        }

        // delete media from db
        await prisma.media.deleteMany({
            where: { postId }
        });

        // delete post from db
        await prisma.post.deleteMany({
            where: {
                id: postId
            }
        })
        

        console.log("Post and media deleted successfully.");

    } catch (error) {
        console.log("Error deleting post: ", error);
        throw new Error("Failed to delete post.");
    }
}