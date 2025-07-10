"use server";

import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/lib/session";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const acceptedTypes = ["application/pdf"];
const maxFileSize = 1024 * 1024 * 14; // 14.3MB
const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");
const getMediaType = (mimeType: string): "image" | "video" | "pdf" => {
    if (mimeType === "application/pdf") return "pdf";
    throw new Error("Unsupported media type");
};

// checkSum will make sure the file arrives in the S3 bucket in the same way left the client
const getSignedURL = async (type: string, size: number, checkSum: string) => {

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

  const putObjCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: generateFileName(),
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

  /*
  // checksum  String   @unique
  const existing = await prisma.media.findFirst({
    where: {
        checksum: checkSum,
        userId: session.id, 
    },
    });

    if (existing) {
        return {
            success: {
            url: existing.url,
            mediaId: existing.id,
            reused: true,
            },
        };
    }
    */

  const media = await prisma.media.create({
    data: {
        userId: session.id,
        type: getMediaType(type),
        url: signedURL,
    }
  })

  return { success: { url: signedURL, mediaId: media.id } };
};

export default getSignedURL;
