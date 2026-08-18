import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({ query: z.string().min(2).max(200) });

export const connectChannel = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["YOUTUBE_API_KEY"];
    if (!key) {
      throw new Error(
        "MISSING_KEY: a chave da API do YouTube ainda não foi configurada neste projeto.",
      );
    }
    const { fetchChannelSnapshot } = await import("./youtube.server");
    return await fetchChannelSnapshot(data.query, key);
  });
