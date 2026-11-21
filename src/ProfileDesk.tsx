import { useEffect, useId, useRef, useState } from 'react';
import type { StageContent } from '../shared/types';
import './profile-desk.css';

type Profile = NonNullable<StageContent['profile']>;
type Post = Profile['posts'][number];

function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}

function ProfileIcon({ name }: { name: 'grid' | 'expand' | 'close' }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'grid' ? <><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 12h16M12 4v16"/></> : name === 'expand' ? <><path d="M14 4h6v6M20 4l-7 7M10 20H4v-6m0 6 7-7"/></> : <path d="m6 6 12 12M18 6 6 18"/>}
  </svg>;
}

function postCount(count: number): string {
  return count === 1 ? 'objava' : count === 2 ? 'objavi' : count === 3 || count === 4 ? 'objave' : 'objav';
}

export function ProfileDesk({ profile }: { profile: Profile }) {
  const [openedId, setOpenedId] = useState<string | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const openedIndex = profile.posts.findIndex(post => post.id === openedId);
  const openedPost = profile.posts[openedIndex];

  return <section className="social-profile" aria-label={`Profil ${profile.username}`}>
    <header className="social-profile-header">
      <div className="social-profile-avatar"><img src={assetUrl(profile.avatar)} alt={profile.avatarAlt}/></div>
      <div className="social-profile-details">
        <h3 className="social-profile-username">{profile.username}</h3>
        <p className="social-profile-stat"><strong>{profile.posts.length}</strong> {postCount(profile.posts.length)}</p>
        <div className="social-profile-bio"><strong>{profile.name}</strong><p>{profile.bio}</p></div>
      </div>
    </header>
    <div className="social-profile-section"><ProfileIcon name="grid"/><h4>Objave</h4></div>
    <div className="social-profile-gallery">{profile.posts.map((post, index) => <button type="button" className="social-profile-tile" key={post.id} aria-label={`Odpri objavo ${index + 1}`} aria-haspopup="dialog" onClick={event => { opener.current = event.currentTarget; setOpenedId(post.id); }}>
      <img src={assetUrl(post.image)} alt={post.alt}/><span className="social-tile-open" aria-hidden="true"><ProfileIcon name="expand"/></span>
    </button>)}</div>
    {openedPost && <PostDialog profile={profile} post={openedPost} number={openedIndex + 1} returnFocus={opener.current} onClose={() => setOpenedId(null)}/>}
  </section>;
}

export function PasswordPatterns() {
  return <details className="password-patterns">
    <summary>Pogosta slaba gesla</summary>
    <ol>
      <li>Zaporedje številk</li>
      <li>Ime hišnega ljubljenčka</li>
      <li>Zaporedje tipk na tipkovnici</li>
      <li>Beseda »geslo« ali »password«</li>
      <li>Letnica rojstva</li>
      <li>Ponavljanje istega znaka</li>
    </ol>
  </details>;
}

function PostDialog({ profile, post, number, returnFocus, onClose }: {
  profile: Profile;
  post: Post;
  number: number;
  returnFocus: HTMLButtonElement | null;
  onClose: () => void;
}) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      returnFocus?.focus({ preventScroll: true });
    };
  }, [returnFocus]);

  return <dialog className="social-post-dialog" ref={dialogRef} aria-labelledby={`${id}-title`} aria-describedby={`${id}-caption`} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <h3 id={`${id}-title`} className="sr-only">Objava {number} profila {profile.username}</h3>
    <button type="button" className="social-post-close" onClick={onClose} aria-label="Zapri objavo" autoFocus><ProfileIcon name="close"/></button>
    <div className="social-post-layout">
      <figure className="social-post-photo"><img src={assetUrl(post.image)} alt={post.alt}/></figure>
      <div className="social-post-copy">
        <header className="social-post-author"><img src={assetUrl(profile.avatar)} alt=""/><div><strong>{profile.username}</strong><span>{post.location}</span></div></header>
        <div className="social-post-caption" id={`${id}-caption`}><strong>{profile.username}</strong><p>{post.caption}</p></div>
      </div>
    </div>
  </dialog>;
}
