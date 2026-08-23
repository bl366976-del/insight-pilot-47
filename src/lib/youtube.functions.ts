import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({ query: z.string().min(2).max(200) });

export const connectChannel = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const { fetchChannelSnapshot } = await import("./youtube.server");
    return await fetchChannelSnapshot(data.query);
  });
