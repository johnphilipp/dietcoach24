import { Session } from "@/types/types";

export const fetchSession = async (sessionId: number): Promise<Session> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/dietician/session`,
    {
      method: "GET",
      headers: {
        Authentication: process.env.NEXT_PUBLIC_AUTH_TOKEN!,
        "Session-Id": sessionId.toString(),
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch session with ID: ${sessionId}`);
  }

  const session: Session = await response.json();
  return session;
};
