export function Mark({ icon }: { icon: string }) {
  const image = icon.startsWith('data:') || icon.startsWith('http:') || icon.startsWith('https:') || icon.startsWith('/');
  return <span className="vt-mark">{image ? <img src={icon} alt="" /> : <span aria-hidden="true">{icon}</span>}</span>;
}
