import { CaesarCipherPanel } from '@/components/visualizer/caesar-cipher-panel';

export default function CaesarCipherPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">凯撒密码 Caesar Cipher</h1>
        <p className="text-gray-400 text-sm mt-1">
          古典密码：明文每个字母按固定移位数循环替换。
        </p>
      </div>
      <CaesarCipherPanel />
    </div>
  );
}
