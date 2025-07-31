import * as Icons from 'lucide-react';

// Get all icon names from lucide-react
type IconName = keyof typeof Icons;

interface DynamicIconProps {
  name: string; // Accept string
  className?: string;
}

const DynamicIcon = ({ name, className }: DynamicIconProps) => {
  // Check if the provided name is a valid icon name
  const iconName = name as IconName;
  if (!iconName || !(iconName in Icons)) {
    // Return a default icon or null if the icon name is invalid
    return <Icons.Image className={className} />;
  }
  
  const IconComponent = Icons[iconName];

  return <IconComponent className={className} />;
};

export default DynamicIcon;