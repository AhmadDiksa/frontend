'use client';

import { useState } from 'react';
import { ToolCallEvent } from '@/lib/api';

const TOOL_ICONS: Record<string, string> = {
  lihat_menu: '🍽️',
  catat_pesanan: '📋',
  cek_pesanan: '🔍',
  update_status_pesanan: '📌',
  buat_reservasi: '📅',
  cek_reservasi: '🗓️',
  batal_reservasi: '❌',
};

const TOOL_LABELS: Record<string, string> = {
  lihat_menu: 'Melihat Menu',
  catat_pesanan: 'Mencatat Pesanan',
  cek_pesanan: 'Cek Status Pesanan',
  update_status_pesanan: 'Update Status Pesanan',
  buat_reservasi: 'Membuat Reservasi',
  cek_reservasi: 'Cek Reservasi',
  batal_reservasi: 'Batal Reservasi',
};

interface Props {
  tool: ToolCallEvent;
}

export function ToolCallBubble({ tool }: Props) {
  const [expanded, setExpanded] = useState(false);
  const icon = TOOL_ICONS[tool.name] || '🔧';
  const label = TOOL_LABELS[tool.name] || tool.name;

  return (
    <div className="flex gap-3 my-1">
      {/* Spacer to align with AI messages */}
      <div className="w-8 flex-shrink-0" />

      <div className="max-w-[75%]">
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-2 px-3 py-1.5 bg-stone-900 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 hover:border-emerald-500/40 transition-all group"
        >
          <span className="text-sm">{icon}</span>
          <span className="font-medium">{label}</span>
          <span className="text-stone-600 text-xs flex items-center gap-1 ml-1">
            · Google Sheets
            <svg
              className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        {expanded && (
          <div className="mt-1.5 bg-stone-900/80 border border-stone-700/50 rounded-xl p-3 text-xs space-y-2">
            {/* Args */}
            {tool.args && Object.keys(tool.args).length > 0 && (
              <div>
                <p className="text-stone-500 font-medium mb-1">Input:</p>
                <pre className="text-stone-300 whitespace-pre-wrap font-mono text-xs bg-stone-950/50 rounded-lg p-2">
                  {JSON.stringify(tool.args, null, 2)}
                </pre>
              </div>
            )}
            {/* Result */}
            <div>
              <p className="text-stone-500 font-medium mb-1">Output:</p>
              <p className="text-emerald-300/80 leading-relaxed whitespace-pre-wrap">{tool.result}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
