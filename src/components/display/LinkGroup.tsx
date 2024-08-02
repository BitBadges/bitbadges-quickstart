export const LinkGroup = ({ links, className }: { links: { title: string; href: string }[]; className?: string }) => {
  return (
    <div className={className}>
      <div className="text-center flex-center flex-wrap">
        {links.map((x, i) => {
          return (
            <a key={i} href={x.href} className="mx-2">
              {x.title}
            </a>
          );
        })}
      </div>
    </div>
  );
};
