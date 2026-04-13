"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { ChevronDown, ChevronRight, X, Send } from "lucide-react";

interface TaxonomyNode {
  name: string;
  level: string;
  definition?: string;
  color?: string;
  children?: TaxonomyNode[];
  examples?: {
    marque: string;
    model: string;
    unit?: string;
    fictional?: boolean;
  }[];
}

interface Props {
  taxonomy: TaxonomyNode;
}

const levelColors: Record<string, string> = {
  realm: "#c4a35a",
  type: "#64748b",
  scheme: "#9ca3af",
};

const typeColors: Record<string, string> = {
  Androids: "#64748b",
  Bionics: "#166534",
  Vessels: "#0d9488",
  Automata: "#d97706",
  Megatech: "#7c3aed",
  Spectra: "#e11d48",
};

// ---- D3 TREE (desktop) ----
function TaxonomyTreeD3({ data }: { data: TaxonomyNode }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<TaxonomyNode | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    svg.selectAll("*").remove();

    const g = svg.append("g").attr("transform", `translate(${width / 2}, 40)`);

    const root = d3.hierarchy(data);

    // Initially collapse schemes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    root.each((d: any) => {
      if (d.depth >= 2 && d.children) {
        d._children = d.children;
        d.children = null;
      }
    });

    const treeLayout = d3.tree<TaxonomyNode>().size([width - 160, height - 120]);

    function update(source: d3.HierarchyPointNode<TaxonomyNode>) {
      const treeData = treeLayout(root as d3.HierarchyNode<TaxonomyNode>);
      const nodes = treeData.descendants();
      const links = treeData.links();

      // Nodes
      const node = g.selectAll<SVGGElement, d3.HierarchyPointNode<TaxonomyNode>>("g.node").data(
        nodes,
        (d) => d.data.name
      );

      const nodeEnter = node
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", `translate(${source.x},${source.y})`)
        .style("cursor", "pointer")
        .on("click", (_, d) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const anyD = d as any;
          if (anyD._children) {
            anyD.children = anyD._children;
            anyD._children = null;
          } else if (anyD.children) {
            anyD._children = anyD.children;
            anyD.children = null;
          }
          setSelectedNode(d.data);
          update(d as d3.HierarchyPointNode<TaxonomyNode>);
        });

      nodeEnter
        .append("circle")
        .attr("r", (d) => (d.depth === 0 ? 8 : d.depth === 1 ? 6 : 4))
        .attr("fill", (d) => {
          if (d.depth === 0) return levelColors.realm;
          if (d.depth === 1) return typeColors[d.data.name] || levelColors.type;
          return levelColors.scheme;
        })
        .attr("stroke", "var(--foreground)")
        .attr("stroke-width", 1);

      nodeEnter
        .append("text")
        .attr("dy", (d) => (d.depth === 0 ? -14 : -10))
        .attr("x", 0)
        .attr("text-anchor", "middle")
        .attr("fill", "var(--foreground)")
        .attr("font-size", (d) => (d.depth === 0 ? "14px" : d.depth === 1 ? "12px" : "11px"))
        .attr("font-family", "var(--font-heading)")
        .text((d) => d.data.name);

      // Has-children indicator
      nodeEnter
        .filter((d) => !!(d.children || (d as any)._children))
        .append("text")
        .attr("dy", 14)
        .attr("x", 0)
        .attr("text-anchor", "middle")
        .attr("fill", "var(--muted)")
        .attr("font-size", "10px")
        .text("+");

      const nodeUpdate = nodeEnter.merge(node);
      nodeUpdate
        .transition()
        .duration(500)
        .attr("transform", (d) => `translate(${d.x},${d.y})`);

      node.exit().transition().duration(300).style("opacity", 0).remove();

      // Links
      const link = g.selectAll<SVGPathElement, d3.HierarchyPointLink<TaxonomyNode>>("path.link").data(
        links,
        (d) => d.target.data.name
      );

      const linkEnter = link
        .enter()
        .insert("path", "g")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "var(--border)")
        .attr("stroke-width", 1)
        .attr(
          "d",
          d3
            .linkVertical<d3.HierarchyPointLink<TaxonomyNode>, d3.HierarchyPointNode<TaxonomyNode>>()
            .x((d) => source.x)
            .y((d) => source.y) as unknown as string
        );

      linkEnter
        .merge(link)
        .transition()
        .duration(500)
        .attr(
          "d",
          d3
            .linkVertical<d3.HierarchyPointLink<TaxonomyNode>, d3.HierarchyPointNode<TaxonomyNode>>()
            .x((d) => d.x)
            .y((d) => d.y) as unknown as string
        );

      link.exit().transition().duration(300).style("opacity", 0).remove();
    }

    const rootPoint = treeLayout(root as d3.HierarchyNode<TaxonomyNode>);
    update(rootPoint as d3.HierarchyPointNode<TaxonomyNode>);

    // Zoom
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);
    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate(width / 2, 40).scale(0.9)
    );
  }, [data]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        className="w-full bg-card-bg rounded-lg border border-border"
        style={{ height: "60vh", minHeight: 400 }}
      />
      <p className="text-[10px] text-muted mt-2 text-center" style={{ fontFamily: "var(--font-heading)" }}>
        Click nodes to expand. Scroll to zoom. Drag to pan.
      </p>

      {/* Detail panel */}
      {selectedNode && (
        <div className="absolute top-4 right-4 w-72 bg-background border border-border rounded-lg p-4 shadow-lg z-10">
          <div className="flex justify-between items-start mb-2">
            <h3
              className="text-sm font-medium"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {selectedNode.name}
            </h3>
            <button onClick={() => setSelectedNode(null)}>
              <X size={14} className="text-muted" />
            </button>
          </div>
          <p className="text-[10px] text-muted uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            {selectedNode.level}
          </p>
          {selectedNode.definition && (
            <p className="text-xs text-foreground/80 leading-relaxed mb-3">
              {selectedNode.definition}
            </p>
          )}
          {selectedNode.examples && selectedNode.examples.length > 0 && (
            <div>
              <p className="text-[10px] text-muted uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                Examples
              </p>
              <div className="flex flex-col gap-1">
                {selectedNode.examples.map((ex, i) => (
                  <div key={i} className="text-xs flex items-center gap-1">
                    <span className="text-foreground">{ex.marque}</span>
                    <span className="text-muted">{ex.model}</span>
                    {ex.fictional && (
                      <span className="text-[9px] bg-accent/20 text-accent px-1 rounded">
                        Fiction
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---- ACCORDION (mobile) ----
function TaxonomyAccordion({ data }: { data: TaxonomyNode }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {data.children?.map((type) => (
        <div key={type.name} className="border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => toggle(type.name)}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-left hover:bg-card-bg transition-colors"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {expanded.has(type.name) ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: typeColors[type.name] || "#999" }}
            />
            {type.name}
            <span className="text-xs text-muted ml-auto">
              {type.children?.length || 0} schemes
            </span>
          </button>
          {expanded.has(type.name) && (
            <div className="px-4 pb-3 border-t border-border">
              <p className="text-xs text-muted my-2">{type.definition}</p>
              {type.children?.map((scheme) => (
                <div key={scheme.name} className="ml-4 mt-2">
                  <button
                    onClick={() => toggle(scheme.name)}
                    className="flex items-center gap-2 text-xs font-medium mb-1"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {expanded.has(scheme.name) ? (
                      <ChevronDown size={12} />
                    ) : (
                      <ChevronRight size={12} />
                    )}
                    {scheme.name}
                  </button>
                  {expanded.has(scheme.name) && (
                    <div className="ml-5">
                      <p className="text-xs text-muted mb-2">
                        {scheme.definition}
                      </p>
                      {scheme.examples && scheme.examples.length > 0 && (
                        <div className="space-y-1">
                          {scheme.examples.map((ex, i) => (
                            <div key={i} className="text-xs flex items-center gap-1">
                              <span className="text-foreground">
                                {ex.marque}
                              </span>
                              <span className="text-muted">{ex.model}</span>
                              {ex.fictional && (
                                <span className="text-[9px] bg-accent/20 text-accent px-1 rounded">
                                  Fiction
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ---- SUBMISSION FORM ----
function SubmissionForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // For now, just show success. Will connect to GitHub API later.
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-foreground mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Thank you for your submission!
        </p>
        <p className="text-xs text-muted">
          Your entry will be reviewed and added to the archive.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-xs text-accent-blue mt-4 hover:underline"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-muted mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            Robot Model Name *
          </label>
          <input
            required
            type="text"
            className="w-full px-3 py-2 text-sm bg-card-bg border border-border rounded-lg focus:outline-none focus:border-accent-blue"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            Marque (Manufacturer) *
          </label>
          <input
            required
            type="text"
            className="w-full px-3 py-2 text-sm bg-card-bg border border-border rounded-lg focus:outline-none focus:border-accent-blue"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            Type *
          </label>
          <select
            required
            className="w-full px-3 py-2 text-sm bg-card-bg border border-border rounded-lg focus:outline-none focus:border-accent-blue"
          >
            <option value="">Select type...</option>
            <option>Androids</option>
            <option>Bionics</option>
            <option>Vessels</option>
            <option>Automata</option>
            <option>Megatech</option>
            <option>Spectra</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            Scheme
          </label>
          <input
            type="text"
            placeholder="e.g. Mechanoids, Zooids..."
            className="w-full px-3 py-2 text-sm bg-card-bg border border-border rounded-lg focus:outline-none focus:border-accent-blue"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-muted mb-1" style={{ fontFamily: "var(--font-heading)" }}>
          Description
        </label>
        <textarea
          rows={3}
          className="w-full px-3 py-2 text-sm bg-card-bg border border-border rounded-lg focus:outline-none focus:border-accent-blue resize-none"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-muted mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            Your Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 text-sm bg-card-bg border border-border rounded-lg focus:outline-none focus:border-accent-blue"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            Website
          </label>
          <input
            type="url"
            placeholder="https://"
            className="w-full px-3 py-2 text-sm bg-card-bg border border-border rounded-lg focus:outline-none focus:border-accent-blue"
          />
        </div>
      </div>
      <button
        type="submit"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <Send size={14} /> Submit Robot
      </button>
    </form>
  );
}

// ---- MAIN ----
export function ArchiveClient({ taxonomy }: Props) {
  return (
    <div className="pt-20 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1
            className="text-2xl md:text-3xl mb-3"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 300 }}
          >
            Robot Archive
          </h1>
          <p className="text-sm text-muted max-w-xl mx-auto">
            An interactive taxonomy of all known robots, organized by the
            classification system from Systema Robotica. Explore the tree and
            discover how robots are categorized across six types and 22 schemes.
          </p>
        </div>

        {/* D3 Tree (desktop) */}
        <div className="hidden lg:block mb-12">
          <TaxonomyTreeD3 data={taxonomy} />
        </div>

        {/* Accordion (mobile) */}
        <div className="lg:hidden mb-12">
          <TaxonomyAccordion data={taxonomy} />
        </div>

        {/* Submission section */}
        <div className="max-w-2xl mx-auto">
          <div className="border-t border-border pt-12">
            <h2
              className="text-lg mb-2"
              style={{ fontFamily: "var(--font-heading)", fontWeight: 400 }}
            >
              Contribute to the Archive
            </h2>
            <p className="text-sm text-muted mb-6">
              Know a robot that should be in the archive? Submit it via the form
              below or{" "}
              <a
                href="https://github.com/systemarobotica/archive"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-blue hover:underline"
              >
                fork the archive repo on GitHub
              </a>{" "}
              and add your entry to{" "}
              <code className="text-xs bg-card-bg px-1 py-0.5 rounded">
                taxonomy.json
              </code>{" "}
              directly via pull request.
            </p>
            <SubmissionForm />
          </div>
        </div>
      </div>
    </div>
  );
}
