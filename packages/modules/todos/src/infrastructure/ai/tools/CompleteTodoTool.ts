import { TodoCompleteToolSchema } from "@corely/contracts";
import { DomainToolPort, DomainToolExecuteParams, DomainToolExecutionResult } from "../../../application/ai-tools/domain-tool.port";
import { CompleteTodoUseCase } from "../../../application/use-cases/complete-todo.usecase";

export class CompleteTodoTool implements DomainToolPort<typeof TodoCompleteToolSchema> {
  name = "todo_complete";
  description = "Marks a Todo task as completed.";
  inputSchema = TodoCompleteToolSchema;
  kind = "server" as const;
  appId = "todos";
  needsApproval = false;

  constructor(private readonly completeTodoUseCase: CompleteTodoUseCase) {}

  async execute(params: DomainToolExecuteParams): Promise<DomainToolExecutionResult> {
    const input = this.inputSchema.parse(params.input);

    const todoDto = await this.completeTodoUseCase.execute(params.tenantId, input.id);

    return {
      message: `Todo task "${todoDto.title}" marked as completed.`,
      data: todoDto,
    };
  }
}
