import { CartesianProductPanel } from '@/components/visualizer/cartesian-product-panel';

export default function CartesianProductPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">笛卡尔积 Cartesian Product</h1>
        <p className="text-gray-400 text-sm mt-1">集合：A × B 的全部有序对（双重循环）。</p>
      </div>
      <CartesianProductPanel />
    </div>
  );
}
