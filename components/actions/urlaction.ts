"use server";

import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/lib/session";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const acceptedTypes = [
  "application/pdf",       // PDF
  "image/jpeg",            // JPG / JPEG
  "image/png",             // PNG
  "video/mp4",             // MP4
  "video/quicktime"        // MOV (QuickTime)
];
const maxFileSize = 1024 * 1024 * 14; // 14.3MB
const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");
const getMediaType = (mimeType: string): "image" | "video" | "pdf" => {
    if (mimeType === "application/pdf") return "pdf";
    if (mimeType.startsWith("image")) return "image";
    if (mimeType.startsWith("video")) return "video";
    throw new Error("Unsupported media type");
};

// checkSum will make sure the file arrives in the S3 bucket in the same way left the client
export const getSignedURL = async (type: string, size: number, checkSum: string) => {

    const session = await getUserSession();
    
    if (!session) {
        return { failure: "Not authenticated" };
    }
    
    if (size > maxFileSize) {
      return { failure: "File is too large" };
    }
    
    // if type is not in acceptedYype
    if (!acceptedTypes.includes(type)) {
      return { failure: "Invalid file type" };
    }
    const fileName = generateFileName(); 
  const putObjCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileName,
    ContentLength: size,
    ContentType: type,
    ChecksumSHA256: checkSum,
    Metadata: {
      userId: session.id,
    },
  });

  const signedURL = await getSignedUrl(s3, putObjCommand, {
    expiresIn: 60,
  });


const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${fileName}`;

  const media = await prisma.media.create({
    data: {
        userId: session.id,
        type: getMediaType(type),
        url: publicUrl,
    }
  })
  console.log(media);

  return { success: { url: signedURL, mediaId: media.id } };
};


type CreatePostProps = {
    content: string;
    mediaId?: string;
}

export const createPost = async ({ content, mediaId }: CreatePostProps) => {
  
  const user = await getUserSession();
  
  if (!user) {
      return { failure: "Not Authenticated" }
  }   

  if (!mediaId) {
    return { failure: "Media ID is required" }
  }

  const media = await prisma.media.findUnique({
    where: {
      id: mediaId
    }
  })

  if (!media) {
    return { failure: "Media not found" }
  }

  const post = await prisma.post.create({
    data: {
      content,
      userId: user.id,
      media: {
        connect: {
          id: mediaId
        }
      }
    },
    include: {
      media: true
    }
  })

  console.log("Post---", post);

//  revalidatePath("/posts");
  redirect("/posts");

}

