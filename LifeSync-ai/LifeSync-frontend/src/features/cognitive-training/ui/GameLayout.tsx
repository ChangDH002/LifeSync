import React from 'react';
import { useNavigate } from 'react-router-dom';

interface GameLayoutProps {
  title: string;      // 게임 이름
  children: React.ReactNode; // 게임 본문 내용
}

export function GameLayout({ title, children }: GameLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-base"> 
      <header className="flex h-20 items-center justify-between border-b border-border bg-surface px-6 shadow-soft sticky top-0 z-50">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-20px font-bold text-contentMid active:scale-95 transition-transform"
          aria-label="이전 화면으로 돌아가기"
        >
          <span className="text-3xl">←</span>
          <span>뒤로</span>
        </button>
        <h1 className="text-28px font-extrabold text-tealDark tracking-tight">
          {title}
        </h1>

        <button 
          className="p-3 text-32px text-contentMid active:rotate-45 transition-transform"
          aria-label="설정"
        >
          ⚙️
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-4xl rounded-[40px] bg-surface p-12 shadow-soft border border-border">
          {children}
        </div>
      </main>
    </div>
  );
}