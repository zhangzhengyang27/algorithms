export interface TreeNode {
  value: number;
  left?: TreeNode;
  right?: TreeNode;
}

export interface GraphNode {
  id: string;
  value: number;
  x: number;
  y: number;
  neighbors: string[];
}

export interface SearchStep {
  type: 'visit' | 'explore' | 'found' | 'backtrack';
  nodeId: string;
  description: string;
  visited: string[];
  currentPath: string[];
}

export interface SearchState {
  nodes: GraphNode[];
  edges: Array<{ from: string; to: string }>;
  steps: SearchStep[];
  currentStep: number;
}

// Binary Tree operations
export function createTreeNode(value: number): TreeNode {
  return { value };
}

export function insertBST(root: TreeNode | undefined, value: number): TreeNode {
  if (!root) {
    return createTreeNode(value);
  }

  if (value < root.value) {
    root.left = insertBST(root.left, value);
  } else {
    root.right = insertBST(root.right, value);
  }

  return root;
}

export function searchBST(root: TreeNode | undefined, value: number): boolean {
  if (!root) return false;
  if (root.value === value) return true;
  if (value < root.value) return searchBST(root.left, value);
  return searchBST(root.right, value);
}

// Generate random BST
export function generateRandomBST(size: number): TreeNode {
  const values = generateUniqueRandomValues(size, 100);
  let root: TreeNode | undefined;

  for (const value of values) {
    root = insertBST(root, value);
  }

  return root!;
}

function generateUniqueRandomValues(count: number, max: number): number[] {
  const values: number[] = [];
  const used = new Set<number>();

  while (values.length < count) {
    const value = Math.floor(Math.random() * max) + 1;
    if (!used.has(value)) {
      used.add(value);
      values.push(value);
    }
  }

  return values;
}

// Generate random graph for BFS/DFS visualization
export function generateRandomGraph(nodeCount: number = 6): { nodes: GraphNode[], edges: Array<{ from: string; to: string }> } {
  const nodes: GraphNode[] = [];
  const edges: Array<{ from: string; to: string }> = [];

  // Create nodes in a circular layout
  const centerX = 250;
  const centerY = 150;
  const radius = 120;

  for (let i = 0; i < nodeCount; i++) {
    const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2;
    nodes.push({
      id: `node-${i}`,
      value: i + 1,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      neighbors: [],
    });
  }

  // Generate edges - ensure connected graph
  const connected = new Set<string>(['node-0']);
  const unconnected = new Set<string>();

  for (let i = 1; i < nodeCount; i++) {
    unconnected.add(`node-${i}`);
  }

  // First connect all nodes to make it a spanning tree
  while (unconnected.size > 0) {
    const connectedArray = Array.from(connected);
    const unconnectedNode = Array.from(unconnected)[0];
    const connectTo = connectedArray[Math.floor(Math.random() * connectedArray.length)];

    const fromId = connectTo;
    const toId = unconnectedNode;

    nodes.find(n => n.id === fromId)?.neighbors.push(toId);
    nodes.find(n => n.id === toId)?.neighbors.push(fromId);
    edges.push({ from: fromId, to: toId });

    connected.add(toId);
    unconnected.delete(toId);
  }

  // Add some extra random edges
  const extraEdges = Math.floor(nodeCount / 2);
  for (let i = 0; i < extraEdges; i++) {
    const fromIdx = Math.floor(Math.random() * nodeCount);
    let toIdx = Math.floor(Math.random() * nodeCount);

    while (toIdx === fromIdx) {
      toIdx = Math.floor(Math.random() * nodeCount);
    }

    const fromId = `node-${fromIdx}`;
    const toId = `node-${toIdx}`;

    if (!edges.some(e =>
      (e.from === fromId && e.to === toId) ||
      (e.from === toId && e.to === fromId)
    )) {
      nodes.find(n => n.id === fromId)?.neighbors.push(toId);
      nodes.find(n => n.id === toId)?.neighbors.push(fromId);
      edges.push({ from: fromId, to: toId });
    }
  }

  return { nodes, edges };
}

// BFS algorithm with step generation
export function generateBFSSteps(
  nodes: GraphNode[],
  startId: string
): SearchStep[] {
  const steps: SearchStep[] = [];
  const visited = new Set<string>();
  const queue: string[] = [startId];
  const visitedOrder: string[] = [];

  visited.add(startId);

  steps.push({
    type: 'visit',
    nodeId: startId,
    description: `从节点 ${nodes.find(n => n.id === startId)?.value} 开始，将其加入队列`,
    visited: [startId],
    currentPath: [startId],
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentNode = nodes.find(n => n.id === current)!;

    visitedOrder.push(current);

    steps.push({
      type: 'explore',
      nodeId: current,
      description: `访问节点 ${currentNode.value}，检查其邻居`,
      visited: [...visitedOrder],
      currentPath: [...visitedOrder],
    });

    for (const neighborId of currentNode.neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push(neighborId);

        const neighbor = nodes.find(n => n.id === neighborId)!;
        steps.push({
          type: 'visit',
          nodeId: neighborId,
          description: `发现未访问节点 ${neighbor.value}，加入队列`,
          visited: [...visitedOrder, neighborId],
          currentPath: [...visitedOrder, neighborId],
        });
      }
    }
  }

  steps.push({
    type: 'found',
    nodeId: startId,
    description: `BFS 完成！共访问 ${visitedOrder.length} 个节点`,
    visited: visitedOrder,
    currentPath: visitedOrder,
  });

  return steps;
}

// DFS algorithm with step generation
export function generateDFSSteps(
  nodes: GraphNode[],
  startId: string
): SearchStep[] {
  const steps: SearchStep[] = [];
  const visited = new Set<string>();
  const visitedOrder: string[] = [];

  function dfs(current: string) {
    if (visited.has(current)) return;

    visited.add(current);
    visitedOrder.push(current);

    const currentNode = nodes.find(n => n.id === current)!;

    if (visitedOrder.length === 1) {
      steps.push({
        type: 'visit',
        nodeId: current,
        description: `从节点 ${currentNode.value} 开始 DFS`,
        visited: [...visitedOrder],
        currentPath: [current],
      });
    } else {
      steps.push({
        type: 'explore',
        nodeId: current,
        description: `访问节点 ${currentNode.value}`,
        visited: [...visitedOrder],
        currentPath: [...visitedOrder],
      });
    }

    for (const neighborId of currentNode.neighbors) {
      if (!visited.has(neighborId)) {
        const neighbor = nodes.find(n => n.id === neighborId)!;
        steps.push({
          type: 'visit',
          nodeId: neighborId,
          description: `探索邻居 ${neighbor.value}`,
          visited: [...visitedOrder],
          currentPath: [...visitedOrder, neighborId],
        });

        dfs(neighborId);

        steps.push({
          type: 'backtrack',
          nodeId: neighborId,
          description: `从节点 ${neighbor.value} 回溯`,
          visited: [...visitedOrder],
          currentPath: visitedOrder.slice(0, visitedOrder.indexOf(neighborId)),
        });
      }
    }
  }

  dfs(startId);

  steps.push({
    type: 'found',
    nodeId: startId,
    description: `DFS 完成！共访问 ${visitedOrder.length} 个节点`,
    visited: visitedOrder,
    currentPath: visitedOrder,
  });

  return steps;
}
