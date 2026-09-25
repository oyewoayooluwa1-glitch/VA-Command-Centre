import { createClient } from "@/lib/supabase/server";
import { addTask, completeTask } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  waiting_on_client: "Waiting on Client",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function TasksPage() {
  const supabase = await createClient();

  const [{ data: tasks, error }, { data: clients }] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, status, priority, due_date, client_id, clients(full_name)")
      .neq("status", "cancelled")
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase.from("clients").select("id, full_name").order("full_name"),
  ]);

  return (
    <main className="wrap" style={{ maxWidth: 640 }}>
      <div className="card" style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, marginBottom: 14 }}>Add a task</h1>
        <form action={addTask}>
          <label htmlFor="title">Title</label>
          <input id="title" name="title" required />
          <label htmlFor="client_id">Client (optional)</label>
          <select id="client_id" name="client_id" style={{ width: "100%", padding: 10, marginBottom: 14, border: "1px solid var(--line)", borderRadius: 8, background: "var(--canvas)", color: "var(--text)" }}>
            <option value="">— No client —</option>
            {clients?.map((c) => (
              <option key={c.id} value={c.id}>{c.full_name}</option>
            ))}
          </select>
          <label htmlFor="due_date">Due date</label>
          <input id="due_date" name="due_date" type="date" />
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" defaultValue="medium" style={{ width: "100%", padding: 10, marginBottom: 14, border: "1px solid var(--line)", borderRadius: 8, background: "var(--canvas)", color: "var(--text)" }}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <button type="submit">Add task</button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ fontSize: 16, marginBottom: 10 }}>Open tasks</h2>
        {error && <p className="error">{error.message}</p>}
        {tasks?.length === 0 && <p style={{ color: "var(--text-3)" }}>Nothing here yet.</p>}
        {tasks?.map((t) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: "1px solid var(--line)" }}>
            <form action={completeTask.bind(null, t.id)}>
              <button
                type="submit"
                disabled={t.status === "completed"}
                title="Mark complete"
                style={{
                  width: 20, height: 20, padding: 0, borderRadius: 5,
                  border: "1.5px solid var(--text-3)",
                  background: t.status === "completed" ? "var(--text)" : "transparent",
                }}
              />
            </form>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ textDecoration: t.status === "completed" ? "line-through" : "none", color: t.status === "completed" ? "var(--text-3)" : "var(--text)" }}>
                {t.title}
              </div>
              {/* @ts-expect-error Supabase's embedded-relation typing doesn't infer this shape automatically */}
              {t.clients?.full_name && <div style={{ fontSize: 12.5, color: "var(--text-3)" }}>{t.clients.full_name}</div>}
            </div>
            {t.due_date && <span style={{ fontSize: 12, color: "var(--text-3)" }}>{t.due_date}</span>}
            <span style={{ fontSize: 12, color: "var(--text-3)" }}>{STATUS_LABEL[t.status]}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
