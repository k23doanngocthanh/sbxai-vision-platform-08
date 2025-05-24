
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Search,
  Zap,
  Eye,
  FileText,
  Clock,
  TrendingUp
} from 'lucide-react';
import { API_CONFIG } from '@/lib/constants';

interface Model {
  id: string;
  name: string;
  description: string;
  type: string;
  confidence_threshold: number;
  is_public: boolean;
  created_at: string;
}

export default function Models() {
  const { toast } = useToast();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MODELS}`);
      
      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
      } else {
        throw new Error('Failed to fetch models');
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      toast({
        title: "Error",
        description: "Failed to load AI models",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getModelIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'yolo':
        return <Eye className="h-5 w-5 text-blue-600" />;
      case 'ocr':
        return <FileText className="h-5 w-5 text-green-600" />;
      default:
        return <Zap className="h-5 w-5 text-purple-600" />;
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Models</h1>
          <p className="text-gray-600">
            Explore and use our powerful AI models for object detection and OCR
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Models Grid */}
        {filteredModels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModels.map((model) => (
              <Card key={model.id} className="border-0 shadow-lg hover-lift">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getModelIcon(model.type)}
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {model.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-500">
                          {model.type.toUpperCase()} Model
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="gradient-primary text-white border-0">
                      Public
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-sm">{model.description}</p>
                  
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Confidence: {(model.confidence_threshold * 100).toFixed(0)}%
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(model.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full gradient-primary text-white">
                      <Zap className="mr-2 h-4 w-4" />
                      Try Model
                    </Button>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Zap className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? 'No models found' : 'No models available'}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'AI models will appear here when available'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
