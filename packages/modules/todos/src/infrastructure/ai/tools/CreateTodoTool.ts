import { TodoCreateToolSchema } from "@corely/contracts";
import { DomainToolPort, DomainToolExecuteParams, DomainToolExecutionResult } from "../../../application/ai-tools/domain-tool.port";
import { CreateTodoUseCase } from "../../../application/use-cases/create-todo.usecase";

export class CreateTodoTool implements DomainToolPort<typeof TodoCreateToolSchema> {
  name = "todo_create";
  description = "Creates a new Todo task.";
  inputSchema = TodoCreateToolSchema;
  kind = "server" as const;
  appId = "todos";
  needsApproval = false;

  constructor(private readonly createTodoUseCase: CreateTodoUseCase) {}

  async execute(params: DomainToolExecuteParams): Promise<DomainToolExecutionResult> {
    const input = this.inputSchema.parse(params.input);

    const todoDto = await this.createTodoUseCase.execute({
      tenantId: params.tenantId,
      title: input.title,
      description: input.description,
      priority: input.priority || "medium",
      dueDate: input.dueDate,
    });

    return {
      message: `Todo task "${todoDto.title}" created successfully with ID: ${todoDto.id}`,
      data: todoDto,
    };
  }
}
