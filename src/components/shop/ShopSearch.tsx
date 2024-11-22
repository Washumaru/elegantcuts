import { Search } from 'lucide-react';

interface ShopSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ShopSearch({ value, onChange }: ShopSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
      <input
        type="text"
        placeholder="Buscar locales..."
        className="input pl-10 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}