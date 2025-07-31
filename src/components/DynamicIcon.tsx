import * as Icons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
}

const DynamicIcon = ({ name, className }: DynamicIconProps) => {
  // Use 'any' to bypass strict type checking for dynamic keys on the Icons module.
  // This resolves the issue where TypeScript can't guarantee that every key corresponds to a renderable component.
  const IconComponent = (Icons as any)[name];

  if (IconComponent) {
    return <IconComponent className={className} />;
  }
  
  // Return a default icon if the icon name is invalid or not found
  return <Icons.Image className={className} />;
};

export default DynamicIcon;