export const LinkGroup = ({ links, className }: { links: { title: string; href: string }[]; className?: string }) => {
  return (
    <div className={className}>
      <div className="text-center">
        {links.map((x, i) => {
          return (
            <a key={i} href={x.href} style={{ margin: 8 }}>
              {x.title}
            </a>
          );
        })}
      </div>
    </div>
  );
};
