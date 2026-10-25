type MaterialIconProps = {
  name: string;
  className?: string;
};

export const MaterialIcon = (props: MaterialIconProps) => (
  <span aria-hidden className={`material-symbols-outlined ${props.className ?? ''}`}>
    {props.name}
  </span>
);
