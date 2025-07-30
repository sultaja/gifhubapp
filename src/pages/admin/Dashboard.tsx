import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { gifs, categories, tags } from "@/data/mock-data";
import { GitFork, Tag } from "lucide-react";

const Dashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total GIFs</CardTitle>
            <GitFork className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gifs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Categories
            </CardTitle>
            <GitFork className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags.length}</div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Welcome to the Admin Panel</h2>
        <p className="text-muted-foreground">
          Here you can manage all the content on GifHub.App. Use the sidebar to navigate between GIFs, categories, and tags.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;