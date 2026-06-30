import { DomainToolPort } from "./domain-tool.port";

export class DomainToolRegistry {
  private readonly tools = new Map<string, DomainToolPort>();

  register(tool: DomainToolPort): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool already registered: ${tool.name}`);
    }

    this.tools.set(tool.name, tool);
  }

  get(name: string): DomainToolPort | null {
    return this.tools.get(name) ?? null;
  }

  listByApp(appId: string): DomainToolPort[] {
    return Array.from(this.tools.values()).filter((tool) => tool.appId === appId);
  }

  list(): DomainToolPort[] {
    return Array.from(this.tools.values());
  }
}
