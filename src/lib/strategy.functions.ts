import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({ context: z.string().min(10).max(16000) });

export const generateStrategy = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("MISSING_KEY");
    const { generateStrategyPlan } = await import("./strategy.server");
    return await generateStrategyPlan(data.context, key);
  });
