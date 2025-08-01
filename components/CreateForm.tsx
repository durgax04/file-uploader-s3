"use client";

import Image from "next/image";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { createPost, getSignedURL } from "./actions/urlaction";

const CreateForm = ({
  user,
}: {
  user: { name?: string | null; image?: string | null };
}) => {
  const [statusMessage, setStatusMessage] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [fileUrl, setFileUrl] = useState<string | undefined>("");

  const buttonDisabled = content.length < 1 || loading;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setStatusMessage("Uploading...");
    setLoading(true);

    // TODO: do pdf load thingy
    console.log("Here I am ---", { content, file });

    // url encryption
    const computeSHA256 = async (file: File) => {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      return hashHex;
    };

    try {
      if (file) {
        setStatusMessage("Uploading file...");

        const checkSum = await computeSHA256(file);

        const signedURLResult = await getSignedURL(
          file.type,
          file.size,
          checkSum
        );
        console.log(signedURLResult);

        if (signedURLResult.failure) {
          setStatusMessage(`Upload error: ${signedURLResult.failure}`);
          setLoading(false);
          return;
        }

        const { url, mediaId } = signedURLResult.success!;
        console.log("url---", { url });
        console.log("mediaId---", { mediaId });

        const res = await fetch(url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!res.ok) {
          setStatusMessage("Upload to S3 failed");
          setLoading(false);
          return;
        }

        // create post
        await createPost({ content, mediaId });
      }
    } catch (error) {
      setStatusMessage("Failed");
      console.log("Error during uploading file in s3 ----", error);
    } finally {
      setLoading(false);
    }

    // Simulate upload delay
    await new Promise((res) => setTimeout(res, 1000));

    setStatusMessage("Uploaded!");
    setContent("");
    setFile(undefined);
    setFileUrl(undefined);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // grabs the first file (in case nothing is selected)
    const file = e.target.files?.[0];
    setFile(file);

    if (fileUrl) {
      // delete its old URL to free up memory.
      URL.revokeObjectURL(fileUrl);
    }

    if (file) {
      // Create a temporary URL to use this file in the browser
      const url = URL.createObjectURL(file);
      setFileUrl(url);
    } else {
      setFileUrl(undefined);
    }
  };

  return (
    <>
      <form
        className="border border-neutral-500 rounded-lg px-6 py-4"
        onSubmit={handleSubmit}
      >
        {statusMessage && (
          <p className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 mb-4 rounded relative">
            {statusMessage}
          </p>
        )}

        <div className="flex gap-4 items-start pb-4 w-full">
          <div className="rounded-full h-12 w-12 overflow-hidden relative">
            <Image
              className="object-cover"
              src={user.image!}
              alt={user.name || "User"}
              fill
              sizes="1"
            />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <div>{user?.name}</div>

            <input
              type="text"
              className="bg-transparent border-b border-gray-500 focus:outline-none text-white py-1"
              placeholder="Write a message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {fileUrl && file && (
              <div className="flex gap-4 items-center">
                {file.type.startsWith("image") ? (
                  <div className="rounded-lg overflow-hidden w-32 h-32 relative">
                    <Image
                      src={fileUrl}
                      alt={file.name}
                      className="object-cover"
                      width={300}
                      height={300}
                    />
                  </div>
                ) : (
                  <div className="rounded-lg overflow-hidden w-32 h-32 relative">
                    <video
                      className="object-cover"
                      src={fileUrl}
                      autoPlay
                      loop
                      muted
                    />
                  </div>
                )}
              </div>
            )}

            {fileUrl && (
              <button
                type="button"
                className="border rounded-xl px-4 py-2 hover:border-red-500 hover:text-red-500"
                onClick={() => {
                  setFile(undefined);
                  setFileUrl(undefined);
                }}
              >
                remove
              </button>
            )}

            {/* File upload */}
            <label className="flex items-center gap-2 mt-2 cursor-pointer text-sm text-gray-400 hover:text-white transition">
              <svg
                className="w-5 h-5"
                aria-label="Attach media"
                role="img"
                viewBox="0 0 20 20"
              >
                <title>Attach media</title>
                <path
                  d="M13.9455 9.0196L8.49626 14.4688C7.16326 15.8091 5.38347 15.692 4.23357 14.5347C3.07634 13.3922 2.9738 11.6197 4.30681 10.2794L11.7995 2.78669C12.5392 2.04694 13.6745 1.85651 14.4289 2.60358C15.1833 3.3653 14.9855 4.4859 14.2458 5.22565L6.83367 12.6524C6.57732 12.9088 6.28435 12.8355 6.10124 12.6671C5.94011 12.4986 5.87419 12.1983 6.12322 11.942L11.2868 6.78571C11.6091 6.45612 11.6164 5.97272 11.3088 5.65778C10.9938 5.35749 10.5031 5.35749 10.1808 5.67975L4.99529 10.8653C4.13835 11.7296 4.1823 13.0626 4.95134 13.8316C5.77898 14.6592 7.03874 14.6446 7.903 13.7803L15.3664 6.32428C16.8678 4.81549 16.8312 2.83063 15.4909 1.4903C14.1799 0.179264 12.1584 0.106021 10.6496 1.60749L3.10564 9.16608C1.16472 11.1143 1.27458 13.9268 3.06169 15.7139C4.8488 17.4937 7.6613 17.6109 9.60955 15.6773L15.1027 10.1841C15.4103 9.87653 15.4103 9.30524 15.0881 9.00495C14.7878 8.68268 14.2677 8.70465 13.9455 9.0196Z"
                  className="fill-current"
                ></path>
              </svg>
              <span>Attach File (jpeg, png, mp4, webm)</span>
              <input
                type="file"
                accept=".pdf,image/jpeg,image/png,video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={handleChange}
              />
            </label>
          </div>
        </div>

        {file && (
          <div className="border border-neutral-700 px-4 py-2 w-fit rounded-md text-sm text-gray-300 mt-2">
            {file.name}
          </div>
        )}

        <div className="flex justify-between items-center mt-5">
          <div className="text-neutral-500 text-sm">
            Character count: {content.length}
          </div>
          <button
            type="submit"
            className={twMerge(
              "border rounded-xl px-4 py-2 transition bg-blue-600 hover:bg-blue-700 text-white",
              buttonDisabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={buttonDisabled}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>

      {/* Show  */}

      <div></div>
    </>
  );
};

export default CreateForm;
