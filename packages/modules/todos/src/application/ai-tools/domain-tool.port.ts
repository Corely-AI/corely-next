import { z } from "zod";

export type ToolKind = "server";

export type ToolApprovalLevel = "none" | "approval_required" | "blocked";

export type DomainToolExecuteParams = {
  tenantId: string;
  userId: string;
  projectId?: string | undefined;
  conversationId?: string | undefined;
  input: unknown;
};

export type DomainToolExecutionResult = {
  message?: string;
  data?: unknown;
  toolCards?: unknown[];
  auditEventId?: string;
};

export interface DomainToolPort<
  TInputSchema extends z.ZodTypeAny = z.ZodTypeAny,
> {
  name: string;
  description: string;
  inputSchema: TInputSchema;
  kind: ToolKind;
  appId: string;
  needsApproval: boolean;

  execute(params: DomainToolExecuteParams): Promise<DomainToolExecutionResult>;
}
