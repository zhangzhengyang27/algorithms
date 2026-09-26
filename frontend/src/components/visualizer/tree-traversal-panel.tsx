'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RefreshCw, ChevronRight, RotateCcw } from 'lucide-react';
import { TreeNode, insertBST, generateRandomBST } from '@/lib/algorithms/graph';
import clsx from 'clsx';
import { CodePanel } from './code-panel';

const treeTraversalCode = [
  'function inorder(root) {',
  '  if (root === null) return;',
  '  inorder(root.left);    // 递归左子树',
  '  visit(root);           // 访问当前节点',
  '  inorder(root.right);   // 递归右子树',
  '}',
  '',
  'function preorder(root) {',
  '  if (root === null) return;',
  '  visit(root);           // 访问当前节点',
  '  preorder(root.left);   // 递归左子树',
  '  preorder(root.right);  // 递归右子树',
  '}',
  '',
  'function postorder(root) {',
  '  if (root === null) return;',
  '  postorder(root.left);  // 递归左子树',
  '  postorder(root.right); // 递归右子树',
  '  visit(root);           // 访问当前节点',
  '}',
];

type TraversalType = 'inorder' | 'preorder' | 'postorder';

const traversals = [
  { id: 'inorder', name: '中序遍历 (Inorder)', description: '左 → 根 → 右' },
  { id: 'preorder', name: '先序遍历 (Preorder)', description: '根 → 左 → 右' },
  { id: 'postorder', name: '后序遍历 (Postorder)', description: '左 → 右 → 根' },
] as const;

interface TraversalStep {
  nodeId: string;
  value: number;
  action: 'visit' | 'process' | 'backtrack';
  description: string;
  result: number[];
}

interface NodePos {
  x: number;
  y: number;
}

export function TreeTraversalPanel() {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, NodePos>>(new Map());
  const [treeSize, setTreeSize] = useState(7);
  const [traversal, setTraversal] = useState<TraversalType>('inorder');
  const [steps, setSteps] = useState<TraversalStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentState, setCurrentState] = useState<TraversalStep | null>(null);

  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Stable ID assignment across renders so layout id matches traversal id.
  const idMapRef = useRef<Map<TreeNode, string>>(new Map());
  const idCounterRef = useRef(0);

  const resetIds = () => {
    idMapRef.current.clear();
    idCounterRef.current = 0;
  };

  const getId = (node: TreeNode): string => {
    let id = idMapRef.current.get(node);
    if (id === undefined) {
      id = `node-${idCounterRef.current++}`;
      idMapRef.current.set(node, id);
    }
    return id;
  };

  const assignLayout = useCallback(
    (root: TreeNode): Map<string, NodePos> => {
      const positions = new Map<string, NodePos>();
      resetIds();

      const assign = (
        node: TreeNode | undefined,
        depth: number,
        left: number,
        right: number,
      ): void => {
        if (!node) return;
        const id = getId(node);
        const x = (left + right) / 2;
        const y = depth * 60 + 40;
        positions.set(id, { x, y });
        const nodeLeft: TreeNode | undefined = node.left;
        const nodeRight: TreeNode | undefined = node.right;
        if (nodeLeft) assign(nodeLeft, depth + 1, left, x - 30);
        if (nodeRight) assign(nodeRight, depth + 1, x + 30, right);
      };

      assign(root, 0, 20, 480);
      return positions;
    },
    [],
  );

  const generateNewTree = useCallback(() => {
    const newTree = generateRandomBST(treeSize);
    setTree(newTree);
    setNodePositions(assignLayout(newTree));
    setIsPlaying(false);
    setCurrentStep(0);
    setSteps([]);
    setCurrentState(null);
  }, [treeSize, assignLayout]);

  useEffect(() => {
    generateNewTree();
  }, [generateNewTree]);

  const generateTraversalSteps = useCallback(
    (root: TreeNode, type: TraversalType): TraversalStep[] => {
      const newSteps: TraversalStep[] = [];
      const result: number[] = [];

      const inorder = (node: TreeNode | undefined): void => {
        if (!node) return;
        newSteps.push({
          nodeId: getId(node),
          value: node.value,
          action: 'visit',
          description: `访问节点 ${node.value}，准备遍历左子树`,
          result: [...result],
        });
        const nodeLeft: TreeNode | undefined = node.left;
        const nodeRight: TreeNode | undefined = node.right;
        if (nodeLeft) inorder(nodeLeft);
        newSteps.push({
          nodeId: getId(node),
          value: node.value,
          action: 'process',
          description: `处理节点 ${node.value}`,
          result: [...result, node.value],
        });
        result.push(node.value);
        if (nodeRight) inorder(nodeRight);
        newSteps.push({
          nodeId: getId(node),
          value: node.value,
          action: 'backtrack',
          description: `从节点 ${node.value} 回溯`,
          result: [...result],
        });
      };

      const preorder = (node: TreeNode | undefined): void => {
        if (!node) return;
        newSteps.push({
          nodeId: getId(node),
          value: node.value,
          action: 'process',
          description: `处理节点 ${node.value}`,
          result: [...result, node.value],
        });
        result.push(node.value);
        const nodeLeft: TreeNode | undefined = node.left;
        const nodeRight: TreeNode | undefined = node.right;
        if (nodeLeft) preorder(nodeLeft);
        if (nodeRight) preorder(nodeRight);
        newSteps.push({
          nodeId: getId(node),
          value: node.value,
          action: 'backtrack',
          description: `从节点 ${node.value} 回溯`,
          result: [...result],
        });
      };

      const postorder = (node: TreeNode | undefined): void => {
        if (!node) return;
        newSteps.push({
          nodeId: getId(node),
          value: node.value,
          action: 'visit',
          description: `访问节点 ${node.value}，准备遍历左子树`,
          result: [...result],
        });
        const nodeLeft: TreeNode | undefined = node.left;
        const nodeRight: TreeNode | undefined = node.right;
        if (nodeLeft) postorder(nodeLeft);
        if (nodeRight) postorder(nodeRight);
        newSteps.push({
          nodeId: getId(node),
          value: node.value,
          action: 'process',
          description: `处理节点 ${node.value}`,
          result: [...result, node.value],
        });
        result.push(node.value);
        newSteps.push({
          nodeId: getId(node),
          value: node.value,
          action: 'backtrack',
          description: `从节点 ${node.value} 回溯`,
          result: [...result],
        });
      };

      if (type === 'inorder') inorder(root);
      else if (type === 'preorder') preorder(root);
      else postorder(root);

      newSteps.push({
        nodeId: '',
        value: 0,
        action: 'process',
        description: `遍历完成！结果: [${result.join(', ')}]`,
        result,
      });

      return newSteps;
    },
    [],
  );

  useEffect(() => {
    if (tree) {
      const newSteps = generateTraversalSteps(tree, traversal);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
      if (newSteps.length > 0) {
        setCurrentState(newSteps[0]);
      } else {
        setCurrentState(null);
      }
    }
  }, [tree, traversal, generateTraversalSteps]);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      animationRef.current = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 600);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isPlaying, currentStep, steps.length]);

  useEffect(() => {
    if (steps.length > 0 && currentStep < steps.length) {
      setCurrentState(steps[currentStep]);
    }
  }, [currentStep, steps]);

  // Draw tree on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !tree || nodePositions.size === 0) return;

    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!ctx) return;

    type DrawFn = (node: TreeNode | undefined) => void;

    const drawEdges: DrawFn = (node) => {
      if (!node) return;
      const id = getId(node);
      const pos = nodePositions.get(id);
      if (!pos) return;
      const left: TreeNode | undefined = node.left;
      const right: TreeNode | undefined = node.right;
      if (left) {
        const leftId = getId(left);
        const leftPos = nodePositions.get(leftId);
        if (leftPos) {
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          ctx.lineTo(leftPos.x, leftPos.y);
          ctx.stroke();
        }
        drawEdges(left);
      }
      if (right) {
        const rightId = getId(right);
        const rightPos = nodePositions.get(rightId);
        if (rightPos) {
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          ctx.lineTo(rightPos.x, rightPos.y);
          ctx.stroke();
        }
        drawEdges(right);
      }
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    drawEdges(tree);

    const processedValues = currentState?.result || [];
    const currentNodeId: string | undefined = currentState?.nodeId;
    const visitedNodes = new Set<string>();
    for (let i = 0; i <= currentStep && i < steps.length; i++) {
      const sid = steps[i]?.nodeId;
      if (sid) visitedNodes.add(sid);
    }

    const drawNodes: DrawFn = (node) => {
      if (!node) return;
      const id = getId(node);
      const pos = nodePositions.get(id);
      if (!pos) return;

      const isProcessed = processedValues.includes(node.value);
      const isCurrent = currentNodeId === id;
      const isVisited = visitedNodes.has(id);

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);

      if (isCurrent) {
        ctx.fillStyle = '#F59E0B';
      } else if (isProcessed) {
        ctx.fillStyle = '#10B981';
      } else if (isVisited) {
        ctx.fillStyle = '#3B82F6';
      } else {
        ctx.fillStyle = '#374151';
      }

      ctx.fill();
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.value.toString(), pos.x, pos.y);

      const left: TreeNode | undefined = node.left;
      const right: TreeNode | undefined = node.right;
      if (left) drawNodes(left);
      if (right) drawNodes(right);
    };

    drawNodes(tree);
  }, [tree, nodePositions, currentState, currentStep, steps]);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const currentCodeLine = (() => {
    const action = currentState?.action;
    if (traversal === 'inorder') {
      if (action === 'visit') return 3;
      if (action === 'process') return 4;
      if (action === 'backtrack') return 5;
    } else if (traversal === 'preorder') {
      if (action === 'process') return 10;
      if (action === 'visit') return 11;
      if (action === 'backtrack') return 12;
    } else {
      if (action === 'visit') return 17;
      if (action === 'process') return 19;
      if (action === 'backtrack') return 19;
    }
    return 1;
  })();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" style={{ minHeight: '480px' }}>
      <div className="lg:col-span-3 space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">节点数:</span>
          <input
            type="range"
            min="3"
            max="15"
            value={treeSize}
            onChange={(e) => setTreeSize(Number(e.target.value))}
            className="w-24 accent-blue-500"
          />
          <span className="text-sm text-gray-400 w-6">{treeSize}</span>
        </div>

        <div className="flex items-center gap-2">
          {traversals.map((t) => (
            <button
              key={t.id}
              onClick={() => setTraversal(t.id)}
              className={clsx(
                'px-3 py-2 rounded-lg text-sm transition-colors',
                traversal === t.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-surface-2 text-gray-400 hover:text-white'
              )}
            >
              <div className="text-xs">{t.description}</div>
              <div className="text-xs opacity-70">{t.name.split(' ')[0]}</div>
            </button>
          ))}
        </div>

        <button
          onClick={generateNewTree}
          className="flex items-center gap-2 px-4 py-2 bg-surface-2 hover:bg-edge rounded-lg text-sm transition-colors ml-auto"
        >
          <RotateCcw size={16} />
          新树
        </button>
      </div>

      {/* Visualization */}
      <div className="bg-surface rounded-xl border border-edge p-4">
        <canvas
          ref={canvasRef}
          width={500}
          height={320}
          className="w-full max-w-[500px] mx-auto"
        />
      </div>

      {/* Description */}
      <div className="text-center text-gray-300 text-sm min-h-[1.5rem] p-3 bg-surface rounded-lg border border-edge">
        {currentState?.description || '点击播放开始可视化'}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-700 rounded-full" />
          <span className="text-gray-400">未访问</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full" />
          <span className="text-gray-400">已访问</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded-full" />
          <span className="text-gray-400">当前节点</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full" />
          <span className="text-gray-400">已处理</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={handleReset} className="p-2 text-gray-400 hover:text-white transition-colors">
          <RefreshCw size={20} />
        </button>

        <button
          onClick={isPlaying ? handlePause : handlePlay}
          className={clsx(
            'p-3 rounded-full transition-colors',
            isPlaying ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white'
          )}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>

        <div className="ml-4 text-sm text-gray-400">
          {currentStep + 1} / {steps.length}
        </div>
      </div>

      {/* Step Slider */}
      <div className="px-4">
        <input
          type="range"
          min="0"
          max={Math.max(0, steps.length - 1)}
          value={currentStep}
          onChange={(e) => setCurrentStep(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
      </div>

      {/* Result */}
      <div className="bg-surface rounded-lg border border-edge p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-2">
          {traversals.find((t) => t.id === traversal)?.name} 结果
        </h3>
        <div className="flex flex-wrap gap-2">
          {currentState?.result.map((val, index) => (
            <div key={index} className="flex items-center">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                {val}
              </span>
              {index < currentState.result.length - 1 && (
                <ChevronRight size={14} className="text-gray-500 mx-1" />
              )}
            </div>
          ))}
          {(!currentState || currentState.result.length === 0) && (
            <span className="text-gray-500 text-sm">等待遍历...</span>
          )}
        </div>
      </div>
      </div>
      <div className="lg:col-span-2 min-h-[480px]">
        <CodePanel
          codeLines={treeTraversalCode}
          highlightLine={currentCodeLine}
          description={currentState?.description || ''}
          title="树的遍历"
        />
      </div>
    </div>
  );
}
