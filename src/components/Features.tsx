
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  FileImage, 
  Users, 
  Workflow, 
  BarChart3, 
  Shield,
  Zap,
  Globe
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: "AI-Powered Detection",
    description: "Advanced YOLO models for object detection and OCR with Vietnamese text support",
    badge: "AI",
    gradient: "gradient-primary"
  },
  {
    icon: FileImage,
    title: "Multi-Format Annotation", 
    description: "Support for bounding boxes, polygons, and text annotations across various image formats",
    badge: "Versatile",
    gradient: "gradient-secondary"
  },
  {
    icon: Workflow,
    title: "Streamlined Workflow",
    description: "Complete project management from image upload to annotation export",
    badge: "Efficient",
    gradient: "gradient-accent"
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Comprehensive insights into your annotation projects and team productivity",
    badge: "Insights",
    gradient: "gradient-primary"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Multi-user support with role-based access and real-time collaboration",
    badge: "Teamwork",
    gradient: "gradient-secondary"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 compliant with end-to-end encryption and secure API access",
    badge: "Secure",
    gradient: "gradient-accent"
  },
  {
    icon: Zap,
    title: "High Performance",
    description: "Optimized for speed with batch processing and real-time predictions",
    badge: "Fast",
    gradient: "gradient-primary"
  },
  {
    icon: Globe,
    title: "API Integration",
    description: "RESTful APIs for seamless integration with your existing workflows",
    badge: "Developer",
    gradient: "gradient-secondary"
  }
];

export const Features = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 gradient-primary text-white border-0">Features</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Everything you need for
            <span className="block text-gradient">AI Annotation</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful tools and features designed to accelerate your computer vision projects
            and streamline your annotation workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="border-0 shadow-lg hover-lift bg-white"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-4">
                  <div className={`w-16 h-16 ${feature.gradient} rounded-2xl flex items-center justify-center mb-4`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 text-xs"
                  >
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-gray-600 text-center leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
