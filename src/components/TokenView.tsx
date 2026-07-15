import { Fragment, memo } from 'react';

/** Çok uzun metinlerde DOM şişmesin diye görselleştirme sınırı (sayımlar her zaman tamdır) */
const MAX_RENDER = 6000;
const PALETTE_SIZE = 5;

interface TokenViewProps {
  ids: number[];
  pieces: string[];
  mode: 'text' | 'ids';
}

export const TokenView = memo(function TokenView({ ids, pieces, mode }: TokenViewProps) {
  if (ids.length === 0) {
    return <div className="token-view token-view-empty">Tokenlar burada görünecek.</div>;
  }

  const shownCount = Math.min(ids.length, MAX_RENDER);
  const chips = [];
  for (let i = 0; i < shownCount; i++) {
    const id = ids[i];
    const piece = pieces[i];
    // Çok baytlı bir karakter (ör. ğ, emoji) token sınırında bölünürse tek başına decode edilemez
    const partial = piece.includes('�');
    const newlineCount = piece.split('\n').length - 1;
    chips.push(
      <Fragment key={i}>
        <span
          className={`token c${i % PALETTE_SIZE}${partial ? ' token-partial' : ''}`}
          title={partial ? `Kısmi UTF-8 baytı · ID ${id}` : `${JSON.stringify(piece)} · ID ${id}`}
        >
          {mode === 'ids' ? id : piece.replaceAll('\n', '↵').replaceAll('\t', '⇥')}
        </span>
        {mode === 'text' &&
          Array.from({ length: newlineCount }, (_, k) => <br key={`br${k}`} />)}
      </Fragment>,
    );
  }

  return (
    <div className="token-view">
      {chips}
      {ids.length > MAX_RENDER && (
        <div className="token-more">
          +{(ids.length - MAX_RENDER).toLocaleString('tr-TR')} token daha var; gösterim ilk{' '}
          {MAX_RENDER.toLocaleString('tr-TR')} tokenla sınırlandırıldı.
        </div>
      )}
    </div>
  );
});
