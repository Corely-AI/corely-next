import { describe, expect, it } from "vitest";
import { Todo } from "../../../domain/todo.entity";
import { TodoRepositoryPort } from "../../ports/todo-repository.port";
import { CreateTodoUseCase } from "../create-todo.usecase";
import { ListTodosUseCase } from "../list-todos.usecase";
import { CompleteTodoUseCase } from "../complete-todo.usecase";
import { DomainToolRegistry } from "../../ai-tools/DomainToolRegistry";
import { DomainToolExecutor } from "../../ai-tools/DomainToolExecutor";
import { CreateTodoTool } from "../../../infrastructure/ai/tools/CreateTodoTool";
import { ListTodosTool } from "../../../infrastructure/ai/tools/ListTodosTool";
import { CompleteTodoTool } from "../../../infrastructure/ai/tools/CompleteTodoTool";
import { TodoListQuery } from "@corely/contracts";

class InMemoryTodoRepository implements TodoRepositoryPort {
  public todos = new Map<string, Todo>();

  async findById(tenantId: string, id: string): Promise<Todo | null> {
    const todo = this.todos.get(id);
    if (todo && todo.tenantId === tenantId) {
      return todo;
    }
    return null;
  }

  async save(todo: Todo): Promise<void> {
    this.todos.set(todo.id, todo);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const todo = this.todos.get(id);
    if (todo && todo.tenantId === tenantId) {
      this.todos.delete(id);
    }
  }

  async list(tenantId: string, query: TodoListQuery): Promise<{ items: Todo[]; total: number }> {
    let items = Array.from(this.todos.values()).filter((t) => t.tenantId === tenantId);
    if (query.q) {
      const searchStr = query.q.toLowerCase();
      items = items.filter(
        (t) =>
          t.title.toLowerCase().includes(searchStr) ||
          (t.description && t.description.toLowerCase().includes(searchStr))
      );
    }
    if (query.status) {
      items = items.filter((t) => t.status === query.status);
    }
    const total = items.length;
    const page = query.page || 1;
    const pageSize = query.pageSize || 50;
    items = items.slice((page - 1) * pageSize, page * pageSize);

    return { items, total };
  }
}

describe("Todo AI Tools", () => {
  const tenantId = "tenant-abc";
  const userId = "user-abc";

  const repo = new InMemoryTodoRepository();
  const createUseCase = new CreateTodoUseCase(repo);
  const listUseCase = new ListTodosUseCase(repo);
  const completeUseCase = new CompleteTodoUseCase(repo);

  const createTool = new CreateTodoTool(createUseCase);
  const listTool = new ListTodosTool(listUseCase);
  const completeTool = new CompleteTodoTool(completeUseCase);

  const registry = new DomainToolRegistry();
  registry.register(createTool);
  registry.register(listTool);
  registry.register(completeTool);

  const executor = new DomainToolExecutor(registry);

  it("should create a todo task using todo_create tool", async () => {
    const result = await executor.execute({
      tenantId,
      userId,
      toolName: "todo_create",
      payload: {
        title: "Test AI Tool Implementation",
        description: "Write integration tests and verify logic",
        priority: "high",
      },
    });

    expect(result.message).toContain("Test AI Tool Implementation");
    expect(result.data).toBeDefined();
    const todo = result.data as any;
    expect(todo.title).toBe("Test AI Tool Implementation");
    expect(todo.priority).toBe("high");
    expect(repo.todos.has(todo.id)).toBe(true);
  });

  it("should list todo tasks using todo_list tool", async () => {
    const result = await executor.execute({
      tenantId,
      userId,
      toolName: "todo_list",
      payload: {
        q: "Test AI Tool",
      },
    });

    expect(result.message).toContain("Found 1 Todo tasks");
    const listResponse = result.data as any;
    expect(listResponse.items).toHaveLength(1);
    expect(listResponse.items[0].title).toBe("Test AI Tool Implementation");
  });

  it("should complete a todo task using todo_complete tool", async () => {
    const todosList = Array.from(repo.todos.values());
    const todoId = todosList[0].id;

    const result = await executor.execute({
      tenantId,
      userId,
      toolName: "todo_complete",
      payload: {
        id: todoId,
      },
    });

    expect(result.message).toContain("marked as completed");
    expect((result.data as any).status).toBe("done");

    const updatedTodo = await repo.findById(tenantId, todoId);
    expect(updatedTodo?.status).toBe("done");
  });
});
