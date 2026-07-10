import { useEffect, useState } from 'react';
import { CONTENT_UPDATED_EVENT, getMergedContent, loadMergedContent } from './data/contentStore';

export function useArchiveContent() {
  const [content, setContent] = useState(() => getMergedContent());

  useEffect(() => {
    let isMounted = true;
    const syncContent = async () => {
      const nextContent = await loadMergedContent();
      if (isMounted) setContent(nextContent);
    };

    syncContent();
    window.addEventListener(CONTENT_UPDATED_EVENT, syncContent);

    return () => {
      isMounted = false;
      window.removeEventListener(CONTENT_UPDATED_EVENT, syncContent);
    };
  }, []);

  return content;
}
