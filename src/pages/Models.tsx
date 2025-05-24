
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Cpu,
  Eye,
  FileText,
  Zap,
  Clock,
  Target
} from 'lucide-react';
import { API_CONFIG } from '@/lib/constants';

interface AIModel {
  id: string;
  name: string;
  description: string;
  type: string;
  confidence_threshold: number;
  is_public: boolean;
  created_at: string;
}

export default function Models() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MODELS}`);
      
      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
      } else {
        throw new Error('Failed to load models');
      }
    } catch (error) {
      console.error('Error loading models:', error);
      toast({
        title: "Error",
        description: "Failed to load AI models",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getModelTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'yolo':
        return <Eye className="h-5 w-5 text-blue-600" />;
      case 'ocr':
        return <FileText className="h-5 w-5 text-green-600" />;
      default:
        return <Cpu className="h-5 w-5 text-purple-600" />;
    }
  };

  const getModelTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'yolo':
        return 'bg-blue-100 text-blue-800';
      case 'ocr':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI models...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Models</h1>
              <p className="text-gray-600">
                Available models for object detection and OCR
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/ai-prediction')}
            className="gradient-primary text-white"
          >
            <Zap className="mr-2 h-4 w-4" />
            Try AI Prediction
          </Button>
        </div>

        {/* Models Grid */}
        {models.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => (
              <Card key={model.id} className="border-0 shadow-lg hover-lift">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getModelTypeIcon(model.type)}
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {model.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-500">
                          {model.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Model Info */}
                    <div className="flex items-center justify-between">
                      <Badge className={`${getModelTypeColor(model.type)} border-0`}>
                        {model.type.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="flex items-center">
                        <Target className="mr-1 h-3 w-3" />
                        {(model.confidence_threshold * 100).toFixed(0)}% threshold
                      </Badge>
                    </div>

                    {/* Availability */}
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${model.is_public ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-sm text-gray-600">
                        {model.is_public ? 'Public' : 'Private'} model
                      </span>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="mr-2 h-4 w-4" />
                      Created {new Date(model.created_at).toLocaleDateString()}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <Button
                        onClick={() => navigate(`/ai-prediction?model=${model.id}`)}
                        className="flex-1 gradient-primary text-white"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Try Model
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(model.id);
                          toast({
                            title: "Copied",
                            description: "Model ID copied to clipboard",
                          });
                        }}
                        className="px-3"
                      >
                        Copy ID
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Cpu className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No models available
            </h3>
            <p className="text-gray-500 mb-6">
              AI models will appear here when they become available
            </p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Refresh
            </Button>
          </div>
        )}

        {/* Model Types Info */}
        <Card className="border-0 shadow-lg mt-8">
          <CardHeader>
            <CardTitle>Model Types</CardTitle>
            <CardDescription>
              Understanding different AI model capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">YOLO Detection</h4>
                  <p className="text-sm text-gray-600">
                    Real-time object detection for identifying and locating objects in images with bounding boxes.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">OCR Analysis</h4>
                  <p className="text-sm text-gray-600">
                    Optical Character Recognition for extracting text from images, especially useful for Vietnamese text.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
