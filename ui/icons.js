const h = window.React.createElement;

function svg(props, children) {
  const size = props && props.size ? props.size : 18;
  const strokeWidth = props && props.strokeWidth ? props.strokeWidth : 2.25;
  const className = props && props.className ? props.className : undefined;
  return h(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className,
      "aria-hidden": "true"
    },
    children
  );
}

export function Activity(props) {
  return svg(props, [
    h("path", { key: "a", d: "M22 12h-4l-3 8L9 4l-3 8H2" })
  ]);
}

export function AlertTriangle(props) {
  return svg(props, [
    h("path", { key: "a", d: "m21.7 18.9-8.2-14.2a1.7 1.7 0 0 0-3 0L2.3 18.9A1.7 1.7 0 0 0 3.8 21h16.4a1.7 1.7 0 0 0 1.5-2.1Z" }),
    h("path", { key: "b", d: "M12 9v4" }),
    h("path", { key: "c", d: "M12 17h.01" })
  ]);
}

export function CheckCircle2(props) {
  return svg(props, [
    h("circle", { key: "a", cx: "12", cy: "12", r: "10" }),
    h("path", { key: "b", d: "m9 12 2 2 4-5" })
  ]);
}

export function Clock3(props) {
  return svg(props, [
    h("circle", { key: "a", cx: "12", cy: "12", r: "10" }),
    h("path", { key: "b", d: "M12 6v6l4 2" })
  ]);
}

export function CircleDot(props) {
  return svg(props, [
    h("circle", { key: "a", cx: "12", cy: "12", r: "10" }),
    h("circle", { key: "b", cx: "12", cy: "12", r: "2" })
  ]);
}

export function FileText(props) {
  return svg(props, [
    h("path", { key: "a", d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" }),
    h("path", { key: "b", d: "M14 2v6h6" }),
    h("path", { key: "c", d: "M16 13H8" }),
    h("path", { key: "d", d: "M16 17H8" }),
    h("path", { key: "e", d: "M10 9H8" })
  ]);
}

export function GitBranch(props) {
  return svg(props, [
    h("line", { key: "a", x1: "6", y1: "3", x2: "6", y2: "15" }),
    h("circle", { key: "b", cx: "18", cy: "6", r: "3" }),
    h("circle", { key: "c", cx: "6", cy: "18", r: "3" }),
    h("path", { key: "d", d: "M18 9a9 9 0 0 1-9 9" })
  ]);
}

export function Layers3(props) {
  return svg(props, [
    h("path", { key: "a", d: "m12 2 9 5-9 5-9-5Z" }),
    h("path", { key: "b", d: "m3 12 9 5 9-5" }),
    h("path", { key: "c", d: "m3 17 9 5 9-5" })
  ]);
}

export function Loader2(props) {
  return svg(props, [
    h("path", { key: "a", d: "M21 12a9 9 0 1 1-6.2-8.6" })
  ]);
}

export function RefreshCcw(props) {
  return svg(props, [
    h("path", { key: "a", d: "M21 12a9 9 0 0 1-15 6.7L3 16" }),
    h("path", { key: "b", d: "M3 16h5v5" }),
    h("path", { key: "c", d: "M3 12a9 9 0 0 1 15-6.7L21 8" }),
    h("path", { key: "d", d: "M21 8h-5V3" })
  ]);
}

export function TimerReset(props) {
  return svg(props, [
    h("path", { key: "a", d: "M10 2h4" }),
    h("path", { key: "b", d: "M12 14v-4" }),
    h("path", { key: "c", d: "M4 13a8 8 0 1 0 2.3-5.7" }),
    h("path", { key: "d", d: "M2 7h5v5" })
  ]);
}

export function XCircle(props) {
  return svg(props, [
    h("circle", { key: "a", cx: "12", cy: "12", r: "10" }),
    h("path", { key: "b", d: "m15 9-6 6" }),
    h("path", { key: "c", d: "m9 9 6 6" })
  ]);
}
