import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Session } from "next-auth";

export const getUserSession = async (): Promise<Session["user"] | undefined> => {
  const authUserSession = await getServerSession(authOptions);
  return authUserSession?.user;
};