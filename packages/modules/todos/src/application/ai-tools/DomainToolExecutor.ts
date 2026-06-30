import { DomainToolRegistry } from "./DomainToolRegistry";
import { DomainToolExecutionResult } from "./domain-tool.port";

export class DomainToolExecutor {
  constructor(
    private readonly registry: DomainToolRegistry,
    private readonly auditLogger?: {
      append(input: unknown): Promise<void>;
    },
  ) {}

  async execute(input: {
    tenantId: string;
    userId: string;
    projectId?: string;
    conversationId?: string;
    toolName: string;
    payload: unknown;
  }): Promise<DomainToolExecutionResult> {
    const domainTool = this.registry.get(input.toolName);

    if (!domainTool) {
      throw new Error(`Unknown tool: ${input.toolName}`);
    }

    if (domainTool.needsApproval) {
      throw new Error(
        `Tool ${input.toolName} requires approval and cannot be executed directly by the agent.`,
      );
    }

    const parsedInput = domainTool.inputSchema.parse(input.payload);

    return domainTool.execute({
      tenantId: input.tenantId,
      userId: input.userId,
      projectId: input.projectId,
      conversationId: input.conversationId,
      input: parsedInput,
    });
  }
}
