import { Activity, AlertTriangle, CheckCircle2, Clock3, RefreshCcw, XCircle } from "./icons.js";
import { DetailPanel } from "./detail-panel.js";
import { WorkflowGraph } from "./graph.js";
import { fetchJson, formatDate, formatDuration, normalizeWorkflow, totalTokens, workflowIdFromLocation } from "./state.js";

const React = window.React;
const { useEffect, useMemo, useState } = React;
const { createRoot } = window.ReactDOM;
const h = React.createElement;

function StatusPill({ status }) {
  const icons = {
    completed: h(CheckCircle2, { size: 16 }),
    failed: h(XCircle, { size: 16 }),
    cancelled: h(AlertTriangle, { size: 16 }),
    running: h(Activity, { size: 16 }),
    pending: h(Clock3, { size: 16 })
  };
  return h("span", { className: `status-pill status-${status || "pending"}` }, icons[status] || icons.pending, status || "pending");
}

function Stat({ label, value, tone }) {
  return h("div", { className: `stat ${tone || ""}` }, h("span", null, label), h("strong", null, value));
}

function TopBar({ record, graph, onRefresh, refreshing, error }) {
  const duration =
    record && record.started_at
      ? record.duration_ms || (record.completed_at ? Date.parse(record.completed_at) - Date.parse(record.started_at) : Date.now() - Date.parse(record.started_at))
      : null;
  return h(
    "header",
    { className: "topbar" },
    h(
      "div",
      { className: "title-block" },
      h("div", { className: "brand-row" }, h("span", { className: "brand-mark" }, "U"), h("span", null, "Ultracode")),
      h("h1", null, record && record.task ? record.task : record && record.id ? record.id : "Workflow Monitor"),
      h(
        "p",
        null,
        record
          ? `${record.id} · ${record.cwd || "workspace"}`
          : error
            ? error
            : "Waiting for an Ultracode workflow record."
      )
    ),
    h(
      "div",
      { className: "topbar-actions" },
      h(StatusPill, { status: record && record.status }),
      h(
        "button",
        { className: "icon-button", type: "button", onClick: onRefresh, title: "Refresh workflow", disabled: refreshing },
        h(RefreshCcw, { size: 18, className: refreshing ? "spin" : "" })
      )
    ),
    h(
      "div",
      { className: "stats-strip" },
      h(Stat, { label: "Agents", value: graph.nodes.length }),
      h(Stat, { label: "Running", value: graph.counts.running || 0, tone: "live" }),
      h(Stat, { label: "Done", value: graph.counts.completed || 0, tone: "done" }),
      h(Stat, { label: "Failed", value: (graph.counts.failed || 0) + (graph.counts.cancelled || 0), tone: "danger" }),
      h(Stat, { label: "Tokens", value: totalTokens(record).toLocaleString() }),
      h(Stat, { label: "Elapsed", value: formatDuration(duration) || "0s" })
    )
  );
}

function RunsList({ runs, activeId, onSelect }) {
  return h(
    "nav",
    { className: "runs-list", "aria-label": "Ultracode runs" },
    h("h2", null, "Runs"),
    runs.length
      ? runs.map((run) =>
          h(
            "button",
            {
              key: run.id,
              className: `run-row${run.id === activeId ? " active" : ""} status-${run.status || "pending"}`,
              type: "button",
              onClick: () => onSelect(run.id),
              title: run.task || run.id
            },
            h("span", { className: "run-dot" }),
            h("span", { className: "run-copy" }, h("strong", null, run.task || run.id), h("small", null, `${run.status || "pending"} · ${formatDate(run.updated_at || run.started_at)}`))
          )
        )
      : h("p", { className: "muted" }, "No runs found.")
  );
}

function App() {
  const [workflowId, setWorkflowId] = useState(workflowIdFromLocation());
  const [record, setRecord] = useState(null);
  const [runs, setRuns] = useState([]);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const graph = useMemo(() => normalizeWorkflow(record || {}), [record]);
  const selected = graph.nodes.find((node) => node.id === selectedId) || graph.nodes[0] || null;

  async function load(nextId = workflowId) {
    setRefreshing(true);
    try {
      const endpoint = nextId ? `/api/workflows/${encodeURIComponent(nextId)}` : "/api/workflows/latest";
      const [nextRecord, list] = await Promise.all([fetchJson(endpoint), fetchJson("/api/workflows")]);
      setRecord(nextRecord);
      setRuns(Array.isArray(list.workflows) ? list.workflows : []);
      setWorkflowId(nextRecord.id);
      setError("");
      if (!selectedId && Array.isArray(nextRecord.workers) && nextRecord.workers.length > 0) {
        const first = nextRecord.workers[0];
        setSelectedId(first.id || first.step_id || null);
      }
      if (window.location.pathname !== `/workflow/${nextRecord.id}`) {
        window.history.replaceState(null, "", `/workflow/${nextRecord.id}`);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : String(loadError));
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load(workflowId);
    const timer = setInterval(() => load(workflowId), 1000);
    return () => clearInterval(timer);
  }, [workflowId]);

  function selectRun(id) {
    setSelectedId(null);
    setWorkflowId(id);
    window.history.replaceState(null, "", `/workflow/${id}`);
  }

  return h(
    "main",
    { className: "app-shell" },
    h(TopBar, { record, graph, onRefresh: () => load(workflowId), refreshing, error }),
    error ? h("div", { className: "error-banner" }, h(AlertTriangle, { size: 18 }), h("span", null, error)) : null,
    h(
      "div",
      { className: "workspace" },
      h(RunsList, { runs, activeId: record && record.id, onSelect: selectRun }),
      h(WorkflowGraph, { record: record || {}, graph, selectedId: selected && selected.id, onSelect: setSelectedId }),
      h(DetailPanel, { selected, events: graph.events, record })
    )
  );
}

createRoot(document.getElementById("root")).render(h(App));
