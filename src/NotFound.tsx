import type { RefObject } from 'react';
import './not-found.css';

function TitleLines() {
  return <><span className="not-found-code">404<span>.</span></span><span className="not-found-caption">Ta sled se tu konča.</span></>;
}

export default function NotFound({ headingRef, onHome }: { headingRef: RefObject<HTMLHeadingElement | null>; onHome: () => void }) {
  return <main id="main" className="landing not-found" data-testid="not-found">
    <div className="landing-content">
      <p className="landing-eyebrow">STRAN NI NAJDENA</p>
      <div className="landing-title-wrap ambient-heading" data-ambient-heading>
        <h1 className="landing-title not-found-title" ref={headingRef} tabIndex={-1}><TitleLines/></h1>
        <div className="landing-title not-found-title ambient-heading-light" aria-hidden="true"><TitleLines/></div>
      </div>
      <p className="landing-story">Strani na tem naslovu ni.<br/>Vrni se na začetek in poišči pravo sled.</p>
      <a className="landing-start-button" href={import.meta.env.BASE_URL} onClick={event => {
        if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) {
          event.preventDefault();
          onHome();
        }
      }}>Na začetek</a>
    </div>
  </main>;
}
