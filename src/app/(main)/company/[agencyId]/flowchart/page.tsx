"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  NodeTypes,
  Panel,
  MarkerType,
  ConnectionLineType,
  EdgeTypes,
  BezierEdge,
  StraightEdge,
  StepEdge,
  SmoothStepEdge,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng, toSvg } from 'html-to-image';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorPicker } from '@/components/ui/color-picker';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

// ===== NODE TYPES =====
const RectangleNode = ({ data, selected }: { data: any; selected: boolean }) => {
  return (
    <div
      className={`flex flex-col h-full w-full rounded-md p-3 transition-all ${selected ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
      style={{
        backgroundColor: data.color,
        color: data.textColor,
        borderColor: data.borderColor,
        borderWidth: `${data.borderWidth}px`,
        borderStyle: data.borderStyle,
      }}
    >
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Top} />
      <Handle type="target" position={Position.Bottom} />
      <div className="font-bold text-center border-b pb-1 mb-1" style={{ borderColor: data.textColor }}>
        {data.title}
      </div>
      <div className="text-xs flex-1 overflow-y-auto">
        {data.link ? (
          <a href={data.link} target="_blank" rel="noopener noreferrer" className="whitespace-pre-wrap">
            {data.label}
          </a>
        ) : (
          <div className="whitespace-pre-wrap">{data.label}</div>
        )}
      </div>
      {data.note && (
        <div className="text-xs mt-1 p-1 rounded" style={{ backgroundColor: `${data.textColor}20` }}>
          {data.note}
        </div>
      )}
    </div>
  );
};

const CircleNode = ({ data, selected }: { data: any; selected: boolean }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center h-full w-full rounded-full p-4 transition-all ${selected ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
      style={{
        backgroundColor: data.color,
        color: data.textColor,
        borderColor: data.borderColor,
        borderWidth: `${data.borderWidth}px`,
        borderStyle: data.borderStyle,
      }}
    >
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Top} />
      <Handle type="target" position={Position.Bottom} />
      <div className="font-bold text-center mb-1" style={{ fontSize: '0.8rem' }}>
        {data.title}
      </div>
      <div className="text-xs text-center">
        {data.link ? (
          <a href={data.link} target="_blank" rel="noopener noreferrer">
            {data.label}
          </a>
        ) : (
          data.label
        )}
      </div>
      {data.note && (
        <div 
          className="text-xs mt-1 p-1 rounded-full px-2" 
          style={{ 
            backgroundColor: `${data.textColor}20`,
            fontSize: '0.7rem'
          }}
        >
          {data.note}
        </div>
      )}
    </div>
  );
};

const DiamondNode = ({ data, selected }: { data: any; selected: boolean }) => {
  return (
    <div
      className={`flex flex-col h-full w-full items-center justify-center p-4 transition-all ${selected ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
      style={{
        backgroundColor: data.color,
        color: data.textColor,
        borderColor: data.borderColor,
        borderWidth: `${data.borderWidth}px`,
        borderStyle: data.borderStyle,
        transform: 'rotate(45deg)',
      }}
    >
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Top} />
      <Handle type="target" position={Position.Bottom} />
      <div style={{ transform: 'rotate(-45deg)', width: '100%' }}>
        <div className="font-bold text-center border-b pb-1 mb-1" style={{ borderColor: data.textColor }}>
          {data.title}
        </div>
        <div className="text-xs text-center">
          {data.link ? (
            <a href={data.link} target="_blank" rel="noopener noreferrer">
              {data.label}
            </a>
          ) : (
            data.label
          )}
        </div>
        {data.note && (
          <div 
            className="text-xs mt-1 p-1 rounded" 
            style={{ 
              backgroundColor: `${data.textColor}20`,
              transform: 'rotate(-45deg)',
              fontSize: '0.7rem'
            }}
          >
            {data.note}
          </div>
        )}
      </div>
    </div>
  );
};

const ParallelogramNode = ({ data, selected }: { data: any; selected: boolean }) => {
  return (
    <div
      className={`flex flex-col h-full w-full p-3 transition-all ${selected ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
      style={{
        backgroundColor: data.color,
        color: data.textColor,
        borderColor: data.borderColor,
        borderWidth: `${data.borderWidth}px`,
        borderStyle: data.borderStyle,
        transform: 'skewX(-20deg)',
      }}
    >
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Top} />
      <Handle type="target" position={Position.Bottom} />
      <div style={{ transform: 'skewX(20deg)' }}>
        <div className="font-bold text-center border-b pb-1 mb-1" style={{ borderColor: data.textColor }}>
          {data.title}
        </div>
        <div className="text-xs">
          {data.link ? (
            <a href={data.link} target="_blank" rel="noopener noreferrer">
              {data.label}
            </a>
          ) : (
            data.label
          )}
        </div>
        {data.note && (
          <div 
            className="text-xs mt-1 p-1 rounded" 
            style={{ 
              backgroundColor: `${data.textColor}20`,
              fontSize: '0.7rem'
            }}
          >
            {data.note}
          </div>
        )}
      </div>
    </div>
  );
};

const HexagonNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const points = "25,1 75,1 99,50 75,99 25,99 1,50";
  
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100">
      <polygon
        points={points}
        style={{
          fill: data.color,
          stroke: data.borderColor,
          strokeWidth: data.borderWidth,
          strokeDasharray: data.borderStyle === 'dashed' ? '5,5' : 'none',
        }}
        className={selected ? 'outline outline-2 outline-blue-500' : ''}
      />
      <foreignObject x="15" y="25" width="70" height="50">
        <div
          className="flex flex-col h-full w-full items-center justify-center text-center"
          style={{ color: data.textColor }}
        >
          <div className="font-bold border-b w-full pb-1 mb-1" style={{ 
            borderColor: data.textColor,
            fontSize: '0.7rem'
          }}>
            {data.title}
          </div>
          <div className="text-xs">
            {data.link ? (
              <a href={data.link} target="_blank" rel="noopener noreferrer">
                {data.label}
              </a>
            ) : (
              data.label
            )}
          </div>
          {data.note && (
            <div 
              className="text-xxs mt-1 p-1 rounded" 
              style={{ 
                backgroundColor: `${data.textColor}20`,
              }}
            >
              {data.note}
            </div>
          )}
        </div>
      </foreignObject>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Top} />
      <Handle type="target" position={Position.Bottom} />
    </svg>
  );
};

const nodeTypes = {
  rectangle: RectangleNode,
  circle: CircleNode,
  diamond: DiamondNode,
  parallelogram: ParallelogramNode,
  hexagon: HexagonNode,
};

// ===== EDGE TYPES =====
const CustomEdge = (props: any) => {
  const { data, markerEnd } = props;
  
  const edgeComponents = {
    default: BezierEdge,
    straight: StraightEdge,
    step: StepEdge,
    smoothstep: SmoothStepEdge,
  };
  
  const EdgeComponent = edgeComponents[data?.edgeType || 'default'];
  
  return (
    <EdgeComponent 
      {...props}
      style={{
        stroke: data?.color || '#000',
        strokeWidth: data?.width || 2,
        strokeDasharray: data?.style === 'dashed' ? '5,5' : 'none',
      }}
      markerEnd={markerEnd}
      label={
        data?.label ? (
          <div 
            className="nodrag nopan p-1 text-xs rounded-full shadow-sm"
            style={{
              backgroundColor: data?.labelBgColor || '#fff',
              color: data?.labelColor || '#000',
              border: `1px solid ${data?.labelBorderColor || '#ccc'}`,
            }}
          >
            {data.label}
          </div>
        ) : null
      }
    />
  );
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

// ===== INITIAL DATA =====
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'rectangle',
    position: { x: 250, y: 5 },
    data: { 
      title: 'Start',
      label: 'Double click to edit\nAdd detailed information here',
      note: 'Initial step',
      color: '#3b82f6', 
      textColor: '#ffffff',
      borderColor: '#1d4ed8',
      borderWidth: 2,
      borderStyle: 'solid',
    },
  },
  {
    id: '2',
    type: 'diamond',
    position: { x: 250, y: 150 },
    data: { 
      title: 'Decision',
      label: 'Is this working?',
      note: 'Critical decision point',
      color: '#f59e0b', 
      textColor: '#000000',
      borderColor: '#d97706',
      borderWidth: 3,
      borderStyle: 'solid',
    },
  },
  {
    id: '3',
    type: 'circle',
    position: { x: 100, y: 300 },
    data: { 
      title: 'Yes',
      label: 'Proceed to next step',
      note: 'Positive path',
      color: '#10b981', 
      textColor: '#ffffff',
      borderColor: '#059669',
      borderWidth: 2,
      borderStyle: 'solid',
    },
  },
  {
    id: '4',
    type: 'hexagon',
    position: { x: 400, y: 300 },
    data: { 
      title: 'No',
      label: 'Review and fix issues',
      note: 'Negative path',
      color: '#ef4444', 
      textColor: '#ffffff',
      borderColor: '#dc2626',
      borderWidth: 2,
      borderStyle: 'solid',
    },
  },
  {
    id: '5',
    type: 'parallelogram',
    position: { x: 100, y: 450 },
    data: { 
      title: 'Next Step',
      label: 'Implement solution\nDocument process',
      note: 'Action items',
      color: '#8b5cf6', 
      textColor: '#ffffff',
      borderColor: '#7c3aed',
      borderWidth: 2,
      borderStyle: 'solid',
    },
  },
];

const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2',
    type: 'custom',
    data: {
      label: 'next',
      color: '#64748b',
      width: 2,
      style: 'solid',
      edgeType: 'smoothstep',
      labelBgColor: '#e2e8f0',
      labelColor: '#1e293b',
      labelBorderColor: '#cbd5e1',
    }
  },
  { 
    id: 'e2-3', 
    source: '2', 
    target: '3',
    type: 'custom',
    data: {
      label: 'yes',
      color: '#10b981',
      width: 3,
      style: 'solid',
      edgeType: 'straight',
      labelBgColor: '#d1fae5',
      labelColor: '#065f46',
      labelBorderColor: '#a7f3d0',
    }
  },
  { 
    id: 'e2-4', 
    source: '2', 
    target: '4',
    type: 'custom',
    data: {
      label: 'no',
      color: '#ef4444',
      width: 3,
      style: 'solid',
      edgeType: 'straight',
      labelBgColor: '#fee2e2',
      labelColor: '#b91c1c',
      labelBorderColor: '#fecaca',
    }
  },
  { 
    id: 'e3-5', 
    source: '3', 
    target: '5',
    type: 'custom',
    data: {
      label: 'continue',
      color: '#8b5cf6',
      width: 2,
      style: 'solid',
      edgeType: 'smoothstep',
      labelBgColor: '#ede9fe',
      labelColor: '#5b21b6',
      labelBorderColor: '#ddd6fe',
    }
  },
];

// ===== MAIN COMPONENT =====
const FlowChartMaker = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  
  // Node states
  const [nodeDialogOpen, setNodeDialogOpen] = useState(false);
  const [nodeTitle, setNodeTitle] = useState('');
  const [nodeLabel, setNodeLabel] = useState('');
  const [nodeNote, setNodeNote] = useState('');
  const [nodeLink, setNodeLink] = useState('');
  const [nodeColor, setNodeColor] = useState('#3b82f6');
  const [textColor, setTextColor] = useState('#ffffff');
  const [borderColor, setBorderColor] = useState('#1d4ed8');
  const [borderWidth, setBorderWidth] = useState(2);
  const [borderStyle, setBorderStyle] = useState('solid');
  const [nodeType, setNodeType] = useState('rectangle');
  
  // Edge states
  const [edgeDialogOpen, setEdgeDialogOpen] = useState(false);
  const [edgeLabel, setEdgeLabel] = useState('');
  const [edgeColor, setEdgeColor] = useState('#000000');
  const [edgeWidth, setEdgeWidth] = useState(2);
  const [edgeStyle, setEdgeStyle] = useState('solid');
  const [edgeType, setEdgeType] = useState('default');
  const [edgeArrow, setEdgeArrow] = useState(true);
  const [labelBgColor, setLabelBgColor] = useState('#ffffff');
  const [labelColor, setLabelColor] = useState('#000000');
  const [labelBorderColor, setLabelBorderColor] = useState('#cccccc');
  
  // App states
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [flowName, setFlowName] = useState('My Flowchart');
  const [flowData, setFlowData] = useState('');
  
  const flowRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileView, setMobileView] = useState(false);

  // Check for mobile view on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setMobileView(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // ===== NODE HANDLERS =====
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => 
        addEdge(
          { 
            ...params, 
            type: 'custom',
            markerEnd: edgeArrow ? { type: MarkerType.ArrowClosed } : undefined,
            data: { 
              label: '', 
              color: edgeColor,
              width: edgeWidth,
              style: edgeStyle,
              edgeType: edgeType,
              labelBgColor: labelBgColor,
              labelColor: labelColor,
              labelBorderColor: labelBorderColor,
            },
          }, 
          eds
        )
      );
    },
    [edgeArrow, edgeColor, edgeWidth, edgeStyle, edgeType, labelBgColor, labelColor, labelBorderColor, setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.project({
        x: event.clientX,
        y: event.clientY - 40,
      });

      const newNode: Node = {
        id: uuidv4(),
        type,
        position,
        data: { 
          title: 'Title',
          label: 'Description\nAdd details here',
          note: 'Notes or comments',
          color: nodeColor,
          textColor: textColor,
          borderColor: borderColor,
          borderWidth: borderWidth,
          borderStyle: borderStyle,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodeColor, textColor, borderColor, borderWidth, borderStyle, setNodes]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    setEdgeLabel(edge.data?.label || '');
    setEdgeColor(edge.data?.color || '#000000');
    setEdgeWidth(edge.data?.width || 2);
    setEdgeStyle(edge.data?.style || 'solid');
    setEdgeType(edge.data?.edgeType || 'default');
    setLabelBgColor(edge.data?.labelBgColor || '#ffffff');
    setLabelColor(edge.data?.labelColor || '#000000');
    setLabelBorderColor(edge.data?.labelBorderColor || '#cccccc');
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setNodeTitle(node.data.title || '');
    setNodeLabel(node.data.label || '');
    setNodeNote(node.data.note || '');
    setNodeLink(node.data.link || '');
    setNodeColor(node.data.color || '#3b82f6');
    setTextColor(node.data.textColor || '#ffffff');
    setBorderColor(node.data.borderColor || '#1d4ed8');
    setBorderWidth(node.data.borderWidth || 2);
    setBorderStyle(node.data.borderStyle || 'solid');
    setNodeType(node.type || 'rectangle');
    setNodeDialogOpen(true);
  }, []);

  const updateNode = useCallback(() => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            type: nodeType,
            data: {
              ...node.data,
              title: nodeTitle,
              label: nodeLabel,
              note: nodeNote,
              link: nodeLink,
              color: nodeColor,
              textColor: textColor,
              borderColor: borderColor,
              borderWidth: borderWidth,
              borderStyle: borderStyle,
            },
          };
        }
        return node;
      })
    );
    setNodeDialogOpen(false);
  }, [selectedNode, nodeTitle, nodeLabel, nodeNote, nodeLink, nodeColor, textColor, borderColor, borderWidth, borderStyle, nodeType, setNodes]);

  // ===== EDGE HANDLERS =====
  const updateEdge = useCallback(() => {
    if (!selectedEdge) return;

    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === selectedEdge.id) {
          return {
            ...edge,
            markerEnd: edgeArrow ? { type: MarkerType.ArrowClosed } : undefined,
            data: {
              ...edge.data,
              label: edgeLabel,
              color: edgeColor,
              width: edgeWidth,
              style: edgeStyle,
              edgeType: edgeType,
              labelBgColor: labelBgColor,
              labelColor: labelColor,
              labelBorderColor: labelBorderColor,
            },
          };
        }
        return edge;
      })
    );
    setEdgeDialogOpen(false);
  }, [selectedEdge, edgeLabel, edgeColor, edgeWidth, edgeStyle, edgeType, edgeArrow, labelBgColor, labelColor, labelBorderColor, setEdges]);

  // ===== DRAG HANDLERS =====
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // ===== IMPORT/EXPORT HANDLERS =====
  const downloadImage = useCallback((type: 'png' | 'svg' = 'png') => {
    if (!flowRef.current) return;

    const options = {
      filter: (node: HTMLElement) => {
        if (
          node?.classList?.contains('react-flow__minimap') ||
          node?.classList?.contains('react-flow__controls')
        ) {
          return false;
        }
        return true;
      },
      backgroundColor: '#ffffff',
    };

    const exportFn = type === 'png' ? toPng : toSvg;
    
    exportFn(flowRef.current, options).then((dataUrl) => {
      const a = document.createElement('a');
      a.setAttribute('download', `${flowName}.${type}`);
      a.setAttribute('href', dataUrl);
      a.click();
    });
  }, [flowRef, flowName]);

  const saveFlow = useCallback(() => {
    const flow = { nodes, edges };
    const json = JSON.stringify(flow);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${flowName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges, flowName]);

  const loadFlow = useCallback(() => {
    try {
      const flow = JSON.parse(flowData);
      if (flow.nodes && flow.edges) {
        setNodes(flow.nodes);
        setEdges(flow.edges);
        setImportDialogOpen(false);
      }
    } catch (e) {
      alert('Invalid flow data');
    }
  }, [flowData, setNodes, setEdges]);

  // ===== DELETE HANDLERS =====
  const deleteNode = useCallback(() => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    setSelectedNode(null);
  }, [selectedNode, setNodes, setEdges]);

  const deleteEdge = useCallback(() => {
    if (!selectedEdge) return;
    setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id));
    setSelectedEdge(null);
    setEdgeDialogOpen(false);
  }, [selectedEdge, setEdges]);

  // ===== KEYBOARD SHORTCUTS =====
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete') {
        if (selectedNode) {
          deleteNode();
        } else if (selectedEdge) {
          deleteEdge();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, selectedEdge, deleteNode, deleteEdge]);

  return (
    <div className="flex h-screen flex-col">
      <header className="bg-background border-b p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            {mobileView && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                )}
              </Button>
            )}
            <h1 className="text-xl font-semibold">Flow Chart Maker</h1>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Input 
              value={flowName} 
              onChange={(e) => setFlowName(e.target.value)} 
              className="w-full md:w-40"
              placeholder="Flow name"
            />
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setImportDialogOpen(true)}
                className="flex-1 md:flex-none"
              >
                Import
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1 md:flex-none">
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => saveFlow()}>
                    Save as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadImage('png')}>
                    Export as PNG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadImage('svg')}>
                    Export as SVG
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR */}
        <aside 
          className={`absolute md:relative z-20 h-full w-72 border-r bg-background p-4 overflow-y-auto transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        >
          <h2 className="mb-4 text-lg font-semibold">Shapes</h2>
          <div className="grid grid-cols-2 gap-2">
            {['rectangle', 'circle', 'diamond', 'parallelogram', 'hexagon'].map((type) => (
              <div
                key={type}
                className="flex h-24 cursor-grab items-center justify-center rounded-md border bg-card p-2 font-medium text-center hover:bg-accent transition-colors"
                onDragStart={(event) => onDragStart(event, type)}
                draggable
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="p-3 mb-4 border rounded-md bg-accent/50">
            <p className="text-sm font-medium">Current Connection Style</p>
            <div 
              className="h-2 my-2 rounded-full"
              style={{
                backgroundColor: edgeColor,
                height: `${edgeWidth}px`,
                borderBottom: edgeStyle === 'dashed' ? '2px dashed' : 'none',
              }}
            />
            <p className="text-xs text-muted-foreground">
              Drag from a nodes handle to connect
            </p>
          </div>

          <h2 className="mb-4 text-lg font-semibold">Connection Settings</h2>
          <div className="space-y-4">
            <div>
              <Label>Line Type</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full">
                    {edgeType.charAt(0).toUpperCase() + edgeType.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {['default', 'straight', 'step', 'smoothstep'].map((type) => (
                    <DropdownMenuItem key={type} onClick={() => setEdgeType(type)}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <Label>Line Color</Label>
              <ColorPicker value={edgeColor} onChange={setEdgeColor} />
            </div>
            <div>
              <Label>Line Width</Label>
              <Slider
                value={[edgeWidth]}
                onValueChange={([value]) => setEdgeWidth(value)}
                min={1}
                max={10}
                step={1}
              />
            </div>
            <div>
              <Label>Line Style</Label>
              <RadioGroup 
                value={edgeStyle} 
                onValueChange={setEdgeStyle}
                className="grid grid-cols-2 gap-2 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="solid" id="solid" />
                  <Label htmlFor="solid">Solid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dashed" id="dashed" />
                  <Label htmlFor="dashed">Dashed</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="arrow" 
                checked={edgeArrow} 
                onCheckedChange={(checked) => setEdgeArrow(!!checked)}
              />
              <Label htmlFor="arrow">Show Arrow</Label>
            </div>
          </div>

          <Separator className="my-4" />

          <h2 className="mb-4 text-lg font-semibold">Node Settings</h2>
          <div className="space-y-4">
            <div>
              <Label>Node Color</Label>
              <ColorPicker value={nodeColor} onChange={setNodeColor} />
            </div>
            <div>
              <Label>Text Color</Label>
              <ColorPicker value={textColor} onChange={setTextColor} />
            </div>
            <div>
              <Label>Border Color</Label>
              <ColorPicker value={borderColor} onChange={setBorderColor} />
            </div>
            <div>
              <Label>Border Width</Label>
              <Slider
                value={[borderWidth]}
                onValueChange={([value]) => setBorderWidth(value)}
                min={0}
                max={10}
                step={1}
              />
            </div>
            <div>
              <Label>Border Style</Label>
              <RadioGroup 
                value={borderStyle} 
                onValueChange={setBorderStyle}
                className="grid grid-cols-2 gap-2 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="solid" id="node-solid" />
                  <Label htmlFor="node-solid">Solid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dashed" id="node-dashed" />
                  <Label htmlFor="node-dashed">Dashed</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </aside>

        {/* MAIN FLOW AREA */}
        <div className="flex-1 relative">
          {!sidebarOpen && mobileView && (
            <Button 
              variant="outline" 
              size="icon"
              className="absolute top-4 left-4 z-10"
              onClick={() => setSidebarOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </Button>
          )}
          
          <ReactFlow
            ref={flowRef}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionLineType={ConnectionLineType.SmoothStep}
            connectionMode="loose"
            connectionLineStyle={{
              stroke: edgeColor,
              strokeWidth: edgeWidth,
              strokeDasharray: edgeStyle === 'dashed' ? '5,5' : 'none',
            }}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
          >
            <Controls className="!bottom-2 !right-2 !top-auto" />
            <Background gap={20} />
            <Panel position="top-right" className="!right-2 !top-2">
              {selectedNode && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNodeDialogOpen(true)}
                  >
                    Edit Node
                  </Button>
                  <Button variant="destructive" size="sm" onClick={deleteNode}>
                    Delete
                  </Button>
                </div>
              )}
              {selectedEdge && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEdgeDialogOpen(true)}
                  >
                    Edit Connection
                  </Button>
                  <Button variant="destructive" size="sm" onClick={deleteEdge}>
                    Delete
                  </Button>
                </div>
              )}
            </Panel>
          </ReactFlow>
        </div>
      </div>

      {/* NODE EDIT DIALOG */}
      <Dialog open={nodeDialogOpen} onOpenChange={setNodeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Node</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Tabs defaultValue="content">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="style">Style</TabsTrigger>
              </TabsList>
              <TabsContent value="content">
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={nodeTitle}
                      onChange={(e) => setNodeTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Description (Supports multi-line text)</Label>
                    <Textarea
                      value={nodeLabel}
                      onChange={(e) => setNodeLabel(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Input
                      value={nodeNote}
                      onChange={(e) => setNodeNote(e.target.value)}
                      placeholder="Additional information"
                    />
                  </div>
                  <div>
                    <Label>Link URL</Label>
                    <Input
                      value={nodeLink}
                      onChange={(e) => setNodeLink(e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label>Node Type</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full">
                          {nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {Object.keys(nodeTypes).map((type) => (
                          <DropdownMenuItem key={type} onClick={() => setNodeType(type)}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="style">
                <div className="space-y-4">
                  <div>
                    <Label>Node Color</Label>
                    <ColorPicker value={nodeColor} onChange={setNodeColor} />
                  </div>
                  <div>
                    <Label>Text Color</Label>
                    <ColorPicker value={textColor} onChange={setTextColor} />
                  </div>
                  <div>
                    <Label>Border Color</Label>
                    <ColorPicker value={borderColor} onChange={setBorderColor} />
                  </div>
                  <div>
                    <Label>Border Width</Label>
                    <Slider
                      value={[borderWidth]}
                      onValueChange={([value]) => setBorderWidth(value)}
                      min={0}
                      max={10}
                      step={1}
                    />
                  </div>
                  <div>
                    <Label>Border Style</Label>
                    <RadioGroup 
                      value={borderStyle} 
                      onValueChange={setBorderStyle}
                      className="grid grid-cols-2 gap-2 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="solid" id="dialog-solid" />
                        <Label htmlFor="dialog-solid">Solid</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dashed" id="dialog-dashed" />
                        <Label htmlFor="dialog-dashed">Dashed</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={updateNode}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDGE EDIT DIALOG */}
      <Dialog open={edgeDialogOpen} onOpenChange={setEdgeDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Connection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Connection Label</Label>
              <Input
                value={edgeLabel}
                onChange={(e) => setEdgeLabel(e.target.value)}
                placeholder="Describe this connection"
              />
            </div>
            <div>
              <Label>Line Type</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full">
                    {edgeType.charAt(0).toUpperCase() + edgeType.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {['default', 'straight', 'step', 'smoothstep'].map((type) => (
                    <DropdownMenuItem key={type} onClick={() => setEdgeType(type)}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Line Color</Label>
                <ColorPicker value={edgeColor} onChange={setEdgeColor} />
              </div>
              <div>
                <Label>Line Width</Label>
                <Slider
                  value={[edgeWidth]}
                  onValueChange={([value]) => setEdgeWidth(value)}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>
            </div>
            <div>
              <Label>Line Style</Label>
              <RadioGroup 
                value={edgeStyle} 
                onValueChange={setEdgeStyle}
                className="grid grid-cols-2 gap-2 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="solid" id="edge-solid" />
                  <Label htmlFor="edge-solid">Solid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dashed" id="edge-dashed" />
                  <Label htmlFor="edge-dashed">Dashed</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="edge-arrow" 
                checked={edgeArrow} 
                onCheckedChange={(checked) => setEdgeArrow(!!checked)}
              />
              <Label htmlFor="edge-arrow">Show Arrow</Label>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Label Background</Label>
                <ColorPicker value={labelBgColor} onChange={setLabelBgColor} />
              </div>
              <div>
                <Label>Label Text</Label>
                <ColorPicker value={labelColor} onChange={setLabelColor} />
              </div>
              <div>
                <Label>Label Border</Label>
                <ColorPicker value={labelBorderColor} onChange={setLabelBorderColor} />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="destructive" onClick={deleteEdge}>
              Delete Connection
            </Button>
            <Button onClick={updateEdge}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* IMPORT DIALOG */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Flow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={flowData}
              onChange={(e) => setFlowData(e.target.value)}
              placeholder="Paste your flow JSON here"
              rows={8}
            />
          </div>
          <DialogFooter>
            <Button onClick={loadFlow}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function FlowChartPage() {
  return (
    <ReactFlowProvider>
      <FlowChartMaker />
    </ReactFlowProvider>
  );
}
