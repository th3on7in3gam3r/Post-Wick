export function StarLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 2L13.8 8.4L20 7L15.5 11.5L22 13L15.5 14.5L20 19L13.8 17.6L12 24L10.2 17.6L4 19L8.5 14.5L2 13L8.5 11.5L4 7L10.2 8.4L12 2Z"
        fill="#C9923A"
      />
    </svg>
  );
}

export function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <defs>
        <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F58529" />
          <stop offset="50%" stopColor="#DD2A7B" />
          <stop offset="100%" stopColor="#8134AF" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig)" />
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="#fff" />
    </svg>
  );
}

export function LinkedInIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="3" fill="#0A66C2" />
      <path
        fill="#fff"
        d="M7.5 10v7H5V10h2.5zM6.25 8.75a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zM19 17h-2.5v-3.4c0-.8-.02-1.84-1.12-1.84-1.12 0-1.29.88-1.29 1.78V17H11.6v-7h2.4v.95h.03c.33-.63 1.15-1.3 2.37-1.3 2.53 0 3 1.67 3 3.83V17z"
      />
    </svg>
  );
}

export function FacebookIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#1877F2" />
      <path
        fill="#fff"
        d="M15.5 12.5h-2v7h-3v-7H9v-2.5h1.5V8.5c0-1.5.7-3.8 3.5-3.8h2.5v3h-1.8c-.4 0-.7.2-.7.8v1.5H16l-.5 2.5z"
      />
    </svg>
  );
}

export function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />
    </svg>
  );
}

export function CommentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 11.5a8.4 8.4 0 01-8.4 8.4H8l-5 3V11.5A8.4 8.4 0 0112.6 3 8.4 8.4 0 0121 11.5z" />
    </svg>
  );
}

export function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

export function BookmarkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  );
}
