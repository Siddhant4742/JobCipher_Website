
import { Button } from "@/components/ui/button";

const DashboardHero = () => {
  return (
    <div className="mb-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Making Your Job Search</h1>
      <h2 className="text-2xl font-medium mb-6">
        <span className="text-orange-500">EASY</span> | 
        <span className="text-blue-500"> STRESS FREE</span> | 
        <span className="text-green-500"> SIMPLIFIED</span>
      </h2>
      <p className="text-gray-600 max-w-3xl mb-8">
        Our platform streamlines job search with three powerful tools: Resume SCAN for
        ATS optimization, Job Match Pro to connect with the most relevant job openings,
        and Resume Skills Extraction to enhance resume with keywords.
      </p>
      <div className="flex gap-4">
        <Button 
          size="lg" 
          className="bg-primary hover:bg-primary/90"
        >
          Get Started For Free
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          className="text-primary hover:bg-primary/10"
        >
          Know more
        </Button>
      </div>
    </div>
  );
};

export default DashboardHero;
