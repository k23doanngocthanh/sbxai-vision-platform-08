
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '@/components/AuthDialog';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bot, Image, Zap } from 'lucide-react';

export const Hero = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      setAuthOpen(true);
    }
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 gradient-hero animate-gradient"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 opacity-20">
          <div className="w-20 h-20 bg-white rounded-full animate-float"></div>
        </div>
        <div className="absolute top-40 right-20 opacity-20">
          <div className="w-16 h-16 bg-white rounded-lg animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="absolute bottom-40 left-20 opacity-20">
          <div className="w-12 h-12 bg-white rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              AI-Powered
              <span className="block text-6xl md:text-8xl bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Annotation Platform
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-gray-100 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Streamline your computer vision projects with intelligent annotation tools, 
              automated labeling, and powerful AI models.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4 rounded-xl hover-lift"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/models')}
                className="border-white text-white hover:bg-white hover:text-purple-600 text-lg px-8 py-4 rounded-xl hover-lift"
              >
                Explore AI Models
              </Button>
            </div>

            {/* Feature Icons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="glass-card p-6 rounded-2xl hover-lift">
                <Bot className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
                <h3 className="text-xl font-semibold mb-2">Smart Annotation</h3>
                <p className="text-gray-200">AI-assisted labeling with auto-detection and smart suggestions</p>
              </div>
              
              <div className="glass-card p-6 rounded-2xl hover-lift">
                <Image className="h-12 w-12 mx-auto mb-4 text-blue-300" />
                <h3 className="text-xl font-semibold mb-2">Multi-Format Support</h3>
                <p className="text-gray-200">Handle images, bounding boxes, polygons, and OCR annotations</p>
              </div>
              
              <div className="glass-card p-6 rounded-2xl hover-lift">
                <Zap className="h-12 w-12 mx-auto mb-4 text-green-300" />
                <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
                <p className="text-gray-200">High-performance processing with real-time predictions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthDialog 
        open={authOpen} 
        onOpenChange={setAuthOpen} 
        mode="register"
        onModeChange={() => {}}
      />
    </>
  );
};
