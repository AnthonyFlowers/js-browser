interface ActionButtonProps {
  action: () => void;
  icon: string;
}

export const ActionButto: React.FC<ActionButtonProps> = ({ action, icon }) => {
  return (
    <button className="button is-primary is-small" onClick={() => action()}>
      <span className="icon">
        <i className={`fas ${icon}`}></i>
      </span>
    </button>
  );
};
