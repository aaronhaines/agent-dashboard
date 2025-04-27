import { z } from "zod";

type ToolSchema<Props extends Record<string, any>> = {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: {
      [K in keyof Props]: any;
    };
    required: (keyof Props)[];
  };
};

type ToolDefinition<Props extends z.ZodTypeAny> = {
  name: string;
  description: string;
  schema: z.ZodObject<any>; // Zod schema
  handler: (args: z.infer<Props>) => Promise<any>;
};

export function defineTool<Props extends z.ZodTypeAny>(
  name: string,
  description: string,
  schema: Props,
  handler: (args: z.infer<Props>) => Promise<any>
): ToolDefinition<Props> {
  return { name, description, schema, handler };
}
