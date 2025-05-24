
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Search,
  Grid,
  List,
  Download,
  Edit,
  Eye,
  Calendar,
  FileImage
} from 'lucide-react';
import { API_CONFIG, STORAGE_KEYS } from '@/lib/constants';

interface ProjectImage {
  id: string;
  project_id: string;
  file_path: string;
  original_filename: string;
  file_size: number;
  image_width: number;
  image_height: number;
  uploaded_at: string;
  annotation_count?: number;
}

interface Project {
  project_id: string;
  name: string;
  created_at: string;
}

export default function Gallery() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<ProjectImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !projectId) {
      navigate('/projects');
      return;
    }

    loadData();
  }, [isAuthenticated, projectId, navigate]);

  useEffect(() => {
    const filtered = images.filter(image =>
      image.original_filename.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredImages(filtered);
  }, [images, searchTerm]);

  const loadData = async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      
      // Load project info
      const projectResponse = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}/${projectId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        setProject(projectData);
      }

      // Load images
      const imagesResponse = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECT_IMAGES(projectId!)}?limit=100&offset=0`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (imagesResponse.ok) {
        const imagesData = await imagesResponse.json();
        setImages(imagesData.images || []);
      }
    } catch (error) {
      console.error('Error loading gallery data:', error);
      toast({
        title: "Error",
        description: "Failed to load gallery",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getImageUrl = (imagePath: string) => {
    return `${API_CONFIG.BASE_URL}/api/v1/yolo/rest/images/${imagePath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
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
              onClick={() => navigate(`/projects/${projectId}`)}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Project
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Image Gallery</h1>
              <p className="text-gray-600">
                {project?.name} • {filteredImages.length} images
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Images Grid/List */}
        {filteredImages.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredImages.map((image) => (
                <Card key={image.id} className="border-0 shadow-lg hover-lift">
                  <CardContent className="p-0">
                    <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                      <img
                        src={getImageUrl(image.id)}
                        alt={image.original_filename}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 truncate mb-2">
                        {image.original_filename}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>{image.image_width} × {image.image_height}</span>
                        <span>{formatFileSize(image.file_size)}</span>
                      </div>
                      
                      {image.annotation_count && (
                        <Badge variant="secondary" className="mb-3">
                          {image.annotation_count} annotations
                        </Badge>
                      )}
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/projects/${projectId}/annotate?imageId=${image.id}`)}
                          className="flex-1"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Annotate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(getImageUrl(image.id), '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredImages.map((image) => (
                <Card key={image.id} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-6">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={getImageUrl(image.id)}
                          alt={image.original_filename}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate mb-1">
                          {image.original_filename}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                          <span>{image.image_width} × {image.image_height}</span>
                          <span>{formatFileSize(image.file_size)}</span>
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            {new Date(image.uploaded_at).toLocaleDateString()}
                          </span>
                        </div>
                        {image.annotation_count && (
                          <Badge variant="secondary">
                            {image.annotation_count} annotations
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => navigate(`/projects/${projectId}/annotate?imageId=${image.id}`)}
                          className="gradient-primary text-white"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Annotate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(getImageUrl(image.id), '_blank')}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = getImageUrl(image.id);
                            link.download = image.original_filename;
                            link.click();
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <FileImage className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? 'No images found' : 'No images yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Upload some images to get started with annotation'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => navigate(`/projects/${projectId}/upload`)}
                className="gradient-primary text-white"
              >
                <FileImage className="mr-2 h-4 w-4" />
                Upload Images
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
