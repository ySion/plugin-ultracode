import { AlertTriangle, CheckCircle2, Clock3, GitBranch, Loader2, XCircle } from "./icons.js";

const React = window.React;
const { useLayoutEffect, useMemo, useRef, useState } = React;
const h = React.createElement;

function iconForStatus(status) {
  const props = { size: 18, strokeWidth: 2.35 };
  if (status === "completed") return h(CheckCircle2, props);
  if (status === "failed") return h(XCircle, props);
  if (status === "cancelled") return h(AlertTriangle, props);
  if (status === "running") return h(Loader2, { ...props, className: "spin" });
  return h(Clock3, props);
}

function NodeButton({ node, selected, onSelect, setNodeRef }) {
  return h(
    "button",
    {
      ref: (element) => setNodeRef(node.id, element),
      className: `agent-node status-${node.status}${selected ? " selected" : ""}`,
      onClick: () => onSelect(node.id),
      type: "button",
      title: node.last_message || node.title
    },
    h("span", { className: "node-icon" }, iconForStatus(node.status)),
    h("span", { className: "node-copy" }, h("strong", null, node.title), h("small", null, `${node.kind} · ${node.status}`)),
    h("span", { className: "node-message" }, node.last_message || "")
  );
}

function phaseKey(phase) {
  return String(phase || "Workflow").toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function WorkflowGraph({ record, graph, selectedId, onSelect }) {
  const rootRef = useRef(null);
  const nodeRefs = useRef(new Map());
  const [lines, setLines] = useState([]);
  const status = record && record.status ? record.status : "running";
  const groups = graph.phases.length ? graph.phases : [{ id: "Workflow", label: "Workflow", nodes: [] }];

  const links = useMemo(() => graph.links, [graph.links]);
  const setNodeRef = (id, element) => {
    if (element) nodeRefs.current.set(id, element);
    else nodeRefs.current.delete(id);
  };

  useLayoutEffect(() => {
    const updateLines = () => {
      if (!rootRef.current) return;
      const rootBox = rootRef.current.getBoundingClientRect();
      const next = [];
      for (const link of links) {
        const from = nodeRefs.current.get(link.from);
        const to = nodeRefs.current.get(link.to);
        if (!from || !to) continue;
        const fromBox = from.getBoundingClientRect();
        const toBox = to.getBoundingClientRect();
        next.push({
          x1: fromBox.left + fromBox.width / 2 - rootBox.left,
          y1: fromBox.top + fromBox.height / 2 - rootBox.top,
          x2: toBox.left + toBox.width / 2 - rootBox.left,
          y2: toBox.top + toBox.height / 2 - rootBox.top,
          kind: link.kind
        });
      }
      setLines(next);
    };

    updateLines();
    const resizeObserver = new ResizeObserver(updateLines);
    if (rootRef.current) resizeObserver.observe(rootRef.current);
    for (const element of nodeRefs.current.values()) resizeObserver.observe(element);
    window.addEventListener("resize", updateLines);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateLines);
    };
  }, [links, graph.nodes.length, selectedId]);

  return h(
    "section",
    { className: "workflow-graph", ref: rootRef },
    h(
      "svg",
      { className: "link-layer", ariaHidden: "true" },
      lines.map((line, index) =>
        h("path", {
          key: `${line.x1}-${line.y1}-${line.x2}-${line.y2}-${index}`,
          className: `link-path ${line.kind}`,
          d: `M ${line.x1} ${line.y1} C ${(line.x1 + line.x2) / 2} ${line.y1}, ${(line.x1 + line.x2) / 2} ${line.y2}, ${line.x2} ${line.y2}`
        })
      )
    ),
    h(
      "div",
      {
        className: `workflow-root status-${status}`,
        ref: (element) => setNodeRef("__workflow__", element)
      },
      h(GitBranch, { size: 20 }),
      h("span", null, record && record.task ? record.task : record && record.id ? record.id : "Workflow"),
      h("strong", null, status)
    ),
    h(
      "div",
      { className: "phase-grid" },
      groups.map((group) =>
        h(
          "section",
          { className: `phase-lane phase-${phaseKey(group.id)}`, key: group.id },
          h("header", null, h("span", null, group.label), h("strong", null, group.nodes.length)),
          h(
            "div",
            { className: "node-stack" },
            group.nodes.map((node) =>
              h(NodeButton, {
                key: node.id,
                node,
                selected: node.id === selectedId,
                onSelect,
                setNodeRef
              })
            )
          )
        )
      )
    )
  );
}
