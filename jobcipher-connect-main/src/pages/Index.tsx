
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8 animate-fade-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text">
              Your Career Journey,{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Simplified
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600">
              Upload your resume and let AI find your perfect job match across LinkedIn, Naukri, and more - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary-hover text-white">
                Upload Resume
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-text">
              Why Choose JobCipher?
            </h2>
            <p className="mt-4 text-gray-600">
              Streamline your job search with our powerful features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-white/80 backdrop-blur-md shadow-sm border border-gray-100 hover:shadow-md transition-all animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-text">
              How It Works
            </h2>
            <p className="mt-4 text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="text-center animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">{index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    title: "AI-Powered Matching",
    description: "Our AI analyzes your skills and experience to find the perfect job matches across platforms.",
    icon: (props: any) => (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v20M2 12h20" />
      </svg>
    ),
  },
  {
    title: "Multi-Platform Integration",
    description: "Access jobs from LinkedIn, Naukri, and more - all in one unified dashboard.",
    icon: (props: any) => (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
  {
    title: "Smart Recommendations",
    description: "Get personalized job recommendations based on your unique skill set and preferences.",
    icon: (props: any) => (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        <path d="M12 3a6 6 0 0 1-9 9 9 9 0 1 0 9-9Z" />
      </svg>
    ),
  },
];

const steps = [
  {
    title: "Upload Your Resume",
    description: "Simply upload your resume and let our AI extract your skills and experience.",
  },
  {
    title: "AI Analysis",
    description: "Our advanced AI analyzes your profile and matches you with relevant opportunities.",
  },
  {
    title: "Apply with Ease",
    description: "Apply to multiple jobs across platforms with just a few clicks.",
  },
];

export default Index;
