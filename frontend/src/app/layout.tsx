import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono, Inter } from 'next/font/google';
import { MainLayout } from '@/components/ui/main-layout';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { ProgressBootstrap } from '@/components/progress-bootstrap';
import { getTutorialCount } from '@/lib/tutorial-page';
import './globals.css';

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '算法可视化学习平台',
  description: '通过可视化学习算法与数据结构',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const totalTutorials = await getTutorialCount();
  return (
    <html lang="zh-CN" className={`${display.variable} ${mono.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        {/*
          首屏内联脚本：在 React 挂载前读取持久化的主题并预置 <html>.light class，
          避免刷新时"深色→浅色"的首屏闪烁（FOUC）。读取失败时保持默认深色。
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var raw=localStorage.getItem('algo-visualizer-settings');if(raw){var d=JSON.parse(raw);if(d&&d.state&&d.state.theme==='light')document.documentElement.classList.add('light');}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <ProgressBootstrap totalTutorials={totalTutorials} />
          <MainLayout>{children}</MainLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
