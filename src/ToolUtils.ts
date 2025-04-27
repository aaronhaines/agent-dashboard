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

type ToolDefinition<Props extends Record<string, any>> = {
  schema: ToolSchema<Props>;
  handler: (args: Props) => Promise<any>;
};

export function defineTool<Props extends Record<string, any>>(
  schema: ToolSchema<Props>,
  handler: (args: Props) => Promise<any>
): ToolDefinition<Props> {
  return { schema, handler };
}
