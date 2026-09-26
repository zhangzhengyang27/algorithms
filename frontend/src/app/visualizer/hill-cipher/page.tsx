import { HillCipherPanel } from '@/components/visualizer/hill-cipher-panel';

export default function HillCipherPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">希尔密码 Hill Cipher</h1>
        <p className="text-gray-400 text-sm mt-1">古典密码：每 2 个字母一组，乘密钥矩阵后 mod 26 加密。</p>
      </div>
      <HillCipherPanel />
    </div>
  );
}
