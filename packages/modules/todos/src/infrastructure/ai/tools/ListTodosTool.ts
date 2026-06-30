import { TodoSearchToolSchema } from "@corely/contracts";
import { DomainToolPort, DomainToolExecuteParams, DomainToolExecutionResult } from "../../../application/ai-tools/domain-tool.port";
import { ListTodosUseCase } from "../../../application/use-cases/list-todos.usecase";

export class ListTodosTool implements DomainToolPort<typeof TodoSearchToolSchema> {
  name = "todo_list";
  description = "Lists and searches Todo tasks.";
  inputSchema = TodoSearchToolSchema;
  kind = "server" as const;
  appId = "todos";
  needsApproval = false;

  constructor(private readonly listTodosUseCase: ListTodosUseCase) {}

  async execute(params: DomainToolExecuteParams): Promise<DomainToolExecutionResult> {
    const input = this.inputSchema.parse(params.input);

    const response = await this.listTodosUseCase.execute(params.tenantId, {
      q: input.q,
      status: input.status,
      page: 1,
      pageSize: input.limit || 10,
    });

    return {
      message: `Found ${response.items.length} Todo tasks.`,
      data: response,
    };
  }
}
