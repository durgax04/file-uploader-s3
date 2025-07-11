import FeedPost from "@/components/FeedPost";
import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/lib/session";
import { redirect } from "next/navigation";


const Posts = async () => {

    const user = await getUserSession();

    if (!user) {
        redirect("/");
    }

    const posts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: true
        }
    })

    const media = await prisma.media.findMany({
        where: {
            userId: user.id
        }
    })

    return (
        <>
            <div className="flex flex-col divide-y" style={{ height: "3000" }}> 
                {posts.map((post) => (
                    <FeedPost key={post.id} post={post} user={user} media={media}/>
                ))}
            </div>  
        </>
    );
}

export default Posts;