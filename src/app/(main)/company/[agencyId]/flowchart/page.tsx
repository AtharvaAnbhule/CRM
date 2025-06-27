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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

import { Edit, Image, LineChart, LucideFormInput, Menu, MenuIcon, Palette, Save, Settings, Shapes, Trash, X, ZoomIn, ZoomOut } from 'lucide-react';

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
      label: 'Double click to edit\nAdd your content here',
      color: '#3b82f6', 
      textColor: '#ffffff',
      borderColor: '#1d4ed8',
      borderWidth: 2,
      borderStyle: 'solid',
    },
  }
];

const initialEdges: Edge[] = [];

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
  const [zoom, setZoom] = useState(1);

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
          title: 'New Node',
          label: 'Double click to edit',
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

  // ===== ZOOM HANDLERS =====
  const zoomIn = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn();
    }
  }, [reactFlowInstance]);

  const zoomOut = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut();
    }
  }, [reactFlowInstance]);

  const fitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView();
    }
  }, [reactFlowInstance]);

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
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
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
                    <Save className="mr-2 h-4 w-4" />
                    Save as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadImage('png')}>
                    <Image className="mr-2 h-4 w-4" />
                    Export as PNG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadImage('svg')}>
                    <Image className="mr-2 h-4 w-4" />
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
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Shapes className="h-5 w-5" />
            Shapes
          </h2>
        <div className="grid grid-cols-2 gap-2">
  {['rectangle', 'circle', 'diamond', 'parallelogram', 'hexagon'].map((type) => (
    <TooltipProvider key={type}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="flex h-24 cursor-grab items-center justify-center rounded-md border bg-card p-2 font-medium text-center hover:bg-accent transition-colors"
            onDragStart={(event) => onDragStart(event, type)}
            draggable
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{`Drag to create a ${type} node`}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ))}
</div>

          <Separator className="my-4" />

          <div className="p-3 mb-4 border rounded-md bg-accent/50">
            <p className="text-sm font-medium flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Current Connection Style
            </p>
            <div 
              className="h-2 my-2 rounded-full"
              style={{
                backgroundColor: edgeColor,
                height: `${edgeWidth}px`,
                borderBottom: edgeStyle === 'dashed' ? '2px dashed' : 'none',
              }}
            />
            <p className="text-xs text-muted-foreground">
              Drag from a node's handle to connect
            </p>
          </div>

          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Connection Settings
          </h2>
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

          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Node Settings
          </h2>
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
              <MenuIcon className="h-4 w-4" />
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
            onMove={() => {
              if (reactFlowInstance) {
                setZoom(reactFlowInstance.getZoom());
              }
            }}
          >
            <Controls className="!bottom-2 !right-2 !top-auto" />
            <Background gap={20} />
            
            {/* Custom zoom controls */}
            <Panel position="top-left" className="!left-2 !top-2">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={zoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={zoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={fitView}>
                  <LucideFormInput className="h-4 w-4" />
                </Button>
                <Badge variant="secondary" className="px-2 py-1">
                  {Math.round(zoom * 100)}%
                </Badge>
              </div>
            </Panel>
            
            {/* Selection controls */}
            <Panel position="top-right" className="!right-2 !top-2">
              {selectedNode && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNodeDialogOpen(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={deleteNode}>
                    <Trash className="h-4 w-4 mr-2" />
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
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={deleteEdge}>
                    <Trash className="h-4 w-4 mr-2" />
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
          <Tabs defaultValue="content" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input 
                  value={nodeTitle} 
                  onChange={(e) => setNodeTitle(e.target.value)} 
                  placeholder="Node title"
                />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  value={nodeLabel}
                  onChange={(e) => setNodeLabel(e.target.value)}
                  placeholder="Node content"
                  rows={5}
                />
              </div>
              <div>
                <Label>Note (Optional)</Label>
                <Input
                  value={nodeNote}
                  onChange={(e) => setNodeNote(e.target.value)}
                  placeholder="Small note to display"
                />
              </div>
              <div>
                <Label>Link (Optional)</Label>
                <Input
                  value={nodeLink}
                  onChange={(e) => setNodeLink(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="style" className="space-y-4">
              <div>
                <Label>Node Type</Label>
                <RadioGroup 
                  value={nodeType} 
                  onValueChange={setNodeType}
                  className="grid grid-cols-2 gap-2 mt-2"
                >
                  {['rectangle', 'circle', 'diamond', 'parallelogram', 'hexagon'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={type} />
                      <Label htmlFor={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
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
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <div className="p-4 border rounded-md bg-muted">
                <p className="text-sm text-muted-foreground">
                  Advanced node settings would go here. This could include:
                </p>
                <ul className="mt-2 text-sm text-muted-foreground list-disc pl-4">
                  <li>Custom CSS classes</li>
                  <li>Animation settings</li>
                  <li>Interaction behaviors</li>
                  <li>Data binding options</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNodeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateNode}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDGE EDIT DIALOG */}
      <Dialog open={edgeDialogOpen} onOpenChange={setEdgeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Connection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Label (Optional)</Label>
              <Input
                value={edgeLabel}
                onChange={(e) => setEdgeLabel(e.target.value)}
                placeholder="Connection label"
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
            <div>
              <Label>Label Background Color</Label>
              <ColorPicker value={labelBgColor} onChange={setLabelBgColor} />
            </div>
            <div>
              <Label>Label Text Color</Label>
              <ColorPicker value={labelColor} onChange={setLabelColor} />
            </div>
            <div>
              <Label>Label Border Color</Label>
              <ColorPicker value={labelBorderColor} onChange={setLabelBorderColor} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdgeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateEdge}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* IMPORT DIALOG */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Flow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Paste your flow JSON data</Label>
              <Textarea
                value={flowData}
                onChange={(e) => setFlowData(e.target.value)}
                placeholder="Paste JSON data here"
                rows={8}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Note: Importing will replace your current flow.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={loadFlow}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EXPORT DIALOG */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Flow</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Label>Flow Data</Label>
            <Textarea
              value={JSON.stringify({ nodes, edges }, null, 2)}
              readOnly
              rows={8}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              navigator.clipboard.writeText(JSON.stringify({ nodes, edges }, null, 2));
              setExportDialogOpen(false);
            }}>
              Copy to Clipboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlowChartMaker;