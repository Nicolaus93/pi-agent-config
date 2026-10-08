import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const ORCHESTRATOR_TOOLS = [
  "agent_types",
  "agent_spawn",
  "agent_wait",
  "agent_steer",
  "agent_status",
  "agent_stop",
  "agent_output",
];

const ORCHESTRATOR_PROMPT = `You are the main orchestration agent.

You coordinate work but never inspect, create, edit, or implement project files yourself. Delegate investigation to a scout, planning to a planner, and implementation and verification to a worker (spawn them with agent_spawn using type scout, planner, or worker).

Guidelines:
- First assess whether the request actually needs a plan. Do not invoke the planner by default.
- For straightforward, well-scoped implementation tasks, delegate directly to a worker.
- For quick codebase questions or focused reconnaissance, delegate directly to a scout.
- Use the planner only for ambiguous, complex, architectural, or multi-step work where an implementation plan adds value.
- Before invoking a planner, briefly explain why planning would help. The planner call itself displays a confirmation prompt; if the user declines it, route the request to a worker or scout instead.
- Use the worker for code changes, tests, and verification.
- Give each subagent a complete, focused task with all relevant context available to you.
- Pass the planner's conclusions explicitly to the worker when implementation depends on them.
- Spawn independent children with wait: false, then agent_wait. When a child pauses with a question or needs follow-up work, relay the question to the user if needed and continue it with agent_steer.
- Report subagent results and unresolved decisions concisely to the user.
- Do not claim that work was completed unless a subagent reports concrete verification.`;

export default function mainOrchestrator(pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    const model = ctx.modelRegistry.find("openai-codex", "gpt-5.6-sol");
    if (model) await pi.setModel(model);
    pi.setThinkingLevel("medium");

    const available = new Set(pi.getAllTools().map((tool) => tool.name));
    pi.setActiveTools(ORCHESTRATOR_TOOLS.filter((tool) => available.has(tool)));
  });

  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName !== "agent_spawn") return;

    const input = event.input as { type?: unknown };
    if (input.type !== "planner") return;

    if (!ctx.hasUI) {
      return {
        block: true,
        reason: "Planner approval requires interactive user confirmation. Ask the user first, or delegate directly to a worker/scout.",
      };
    }

    const approved = await ctx.ui.confirm(
      "Start a planning session?",
      "This task was routed to the planner. Continue? Choose No to use a worker or scout instead.",
    );
    if (!approved) {
      return {
        block: true,
        reason: "The user declined a planning session. Delegate directly to a worker, or use a scout for a quick check.",
      };
    }
  });

  pi.on("before_agent_start", (event) => ({
    systemPrompt: `${event.systemPrompt}\n\n${ORCHESTRATOR_PROMPT}`,
  }));
}
