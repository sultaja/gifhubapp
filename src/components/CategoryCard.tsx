import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Category } from "@/types";
import DynamicIcon from "./DynamicIcon";
import { useTranslation } from "react-i18next";
import { getTranslatedName } from "@/lib/translations";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  const { i18n } = useTranslation();
  const name = getTranslatedName(category, i18n.language, 'category_translations');

  return (
    <Link to={`/category/${category.slug}`} className="group block">
      <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out hover:border-primary hover:shadow-lg">
        <CardContent className="flex flex-col items-center justify-center gap-2 p-4 text-center">
          <DynamicIcon name={category.icon || 'Folder'} className="h-8 w-8 text-muted-foreground transition-colors group-hover:text-primary" />
          <span className="font-semibold text-sm">{name}</span>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;