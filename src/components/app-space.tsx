interface AppSpaceProps {
  size: number;
}

function AppSpace(props: AppSpaceProps) {
  return (
    <div
      style={{
        height: `${props.size}rem`,
      }}
    ></div>
  );
}

export default AppSpace;
