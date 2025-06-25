import type { ComponentType } from 'react';
import Button from '@/components/atoms/Button/Button';
type TablerIcon = ComponentType<{
  size?: number;
  className?: string;
  stroke?: number;
}>;

interface SidebarItemProps {
  icon: TablerIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({
  icon,
  label,
  active = false,
  onClick,
}: SidebarItemProps) => {
  return (
    <Button
      sidebarOnly
      icon={icon}
      label={label}
      active={active}
      onClick={onClick}
    />
  );
};

export default SidebarItem;
