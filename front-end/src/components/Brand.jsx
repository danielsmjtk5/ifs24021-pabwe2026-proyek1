import { IconBuildingCommunity } from '@tabler/icons-react';

function Brand({ light = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-blue-600 p-2 text-white shadow-lg shadow-blue-900/30">
        <IconBuildingCommunity className="h-6 w-6" aria-hidden="true" />
      </div>
      <div>
        <p className={`text-lg font-extrabold leading-tight ${light ? 'text-white' : 'text-slate-900'}`}>AsramaCare</p>
        <p className={`text-xs ${light ? 'text-blue-200' : 'text-slate-500'}`}>Pelaporan fasilitas asrama</p>
      </div>
    </div>
  );
}

export default Brand;
