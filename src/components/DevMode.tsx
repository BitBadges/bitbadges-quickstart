import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { DisplayCard } from './display/DisplayCard';
import dynamic from 'next/dynamic';
import crypto from 'crypto';
import '@uiw/react-markdown-preview/markdown.css';
import '@uiw/react-md-editor/markdown-editor.css';

// const MDEditor = dynamic(async () => await import('@uiw/react-md-editor').then((mod) => mod.default), { ssr: false });
const EditerMarkdown = dynamic(
  async () =>
    await import('@uiw/react-md-editor').then((mod) => {
      return mod.default.Markdown;
    }),
  { ssr: false }
);

export function DevMode({
  obj,
  toShow,
  subtitle,
  inheritBg,
  noBorder,
  isJsonDisplay = true,
  noPadding
}: {
  obj?: Object | string;
  toShow?: boolean;
  subtitle?: string | ReactNode;
  inheritBg?: boolean;
  noBorder?: boolean;
  isJsonDisplay?: boolean;
  noPadding?: boolean;
}) {
  if (!obj) return <></>;

  let objStr = obj;
  let isAlreadyStringified = typeof obj === 'string';
  if (!isAlreadyStringified) {
    objStr = JSON.stringify(obj, null, 2);
  }

  if (noPadding && isJsonDisplay) {
    return <MarkdownDisplay showMoreHeight={10000} markdown={'```json\n' + objStr + '\n```'} />;
  }

  return (
    <>
      {toShow && (
        <DisplayCard
          title=""
          span={24}
          subtitle={subtitle}
          inheritBg={isJsonDisplay || inheritBg}
          noBorder={isJsonDisplay || noBorder}
          noPadding
        >
          {isJsonDisplay ? (
            <>
              {/* <b className='primary-text' style={{ fontSize: 16 }}>JSON</b> */}
              <MarkdownDisplay showMoreHeight={10000} markdown={'```json\n' + objStr + '\n```'} />
            </>
          ) : (
            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', textAlign: 'start' }}>{objStr as string}</pre>
          )}
        </DisplayCard>
      )}
    </>
  );
}

export const MarkdownDisplay = ({ markdown, showMoreHeight = 300 }: { markdown: string; showMoreHeight?: number }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const id = useRef(crypto.randomBytes(32).toString());

  const elemRef = useRef<HTMLDivElement>(null);
  const contentHeight = elemRef.current?.clientHeight ?? 0;

  const [contentHeightState, setContentHeightState] = useState(contentHeight);

  useEffect(() => {
    // Check if dark mode is enabled in local storage
    const isDarkMode = !localStorage.getItem('darkMode') || localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
  }, []);

  useLayoutEffect(() => {
    setContentHeightState(elemRef.current?.clientHeight ?? 0);
  }, [markdown]);

  useEffect(() => {
    setContentHeightState(contentHeight);
  }, [contentHeight]);

  useEffect(() => {
    setShowMore(false);
  }, [markdown]);

  const mode = darkMode ? 'dark' : 'light';

  return (
    <div className="primary-text">
      <div
        data-color-mode={mode}
        style={{
          textAlign: 'start',
          overflow: !showMore ? 'hidden' : undefined,

          maxHeight: showMore ? undefined : showMoreHeight
        }}
        id={'description' + id}
        ref={elemRef}
      >
        <EditerMarkdown source={markdown} />
      </div>
      {contentHeightState >= showMoreHeight && (
        <div className="flex-between flex-wrap" style={{ marginTop: '10px' }}>
          <div></div>
          <div>
            <a
              onClick={() => {
                setShowMore(!showMore);
              }}
            >
              {showMore ? 'Show Less' : 'Show More'}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
