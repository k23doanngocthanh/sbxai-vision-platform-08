
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Search,
  Image as ImageIcon,
  Calendar,
  FileText,
  Trash2,
  Eye,
  Download
} from 'lucide-react';
import { API_CONFIG, STORAGE_KEYS } from '@/lib/constants';

interface ProjectImage {
  id: string;
  project_id: string;
  user_id: string;
  file_path: string;
  original_filename: string;
  file_size: number;
  image_width: number;
  image_height: number;
  uploaded_at: string;
}

export default function Gallery() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !projectId) {
      navigate('/projects');
      return;
    }

    fetchImages();
  }, [isAuthenticated, projectId, navigate]);

  const fetchImages = async () => {
    if (!projectId) return;

    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECT_IMAGES(projectId)}?limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
      } else {
        throw new Error('Failed to fetch images');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: "Error",
        description: "Failed to load images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image: ProjectImage) => {
    return `${API_CONFIG.BASE_URL}/api/v1/yolo/rest/images/${image.id}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const deleteImage = async (imageId: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/v1/yolo/rest/images/${imageId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (response.ok) {
        setImages(images.filter(img => img.id !== imageId));
        toast({
          title: "Success",
          description: `Image "${filename}" deleted successfully`,
        });
      } else {
        throw new Error('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const startAnnotation = async (image: ProjectImage) => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const formData = new FormData();
      formData.append('source', 'manual');

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE_SESSIONS(image.id)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        }
      );

      if (response.ok) {
        const session = await response.json();
        navigate(`/projects/${projectId}/annotate/${session.session_id}`);
      } else {
        throw new Error('Failed to create annotation session');
      }
    } catch (error) {
      console.error('Error creating annotation session:', error);
      toast({
        title: "Error",
        description: "Failed to start annotation session",
        variant: "destructive",
      });
    }
  };

  const filteredImages = images.filter(image =>
    image.original_filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
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
                Browse and manage your project images ({images.length} total)
              </p>
            </div>
          </div>

          <Button 
            onClick={() => navigate(`/projects/${projectId}/upload`)}
            className="gradient-primary text-white"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Upload More
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Images Grid */}
        {filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <Card key={image.id} className="border-0 shadow-lg hover-lift overflow-hidden">
                <div className="aspect-square relative bg-gray-100">
                  <img
                    src={getImageUrl(image)}
                    alt={image.original_filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteImage(image.id, image.original_filename)}
                      className="bg-white/80 hover:bg-white text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium truncate">
                    {image.original_filename}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {image.image_width} × {image.image_height} • {formatFileSize(image.file_size)}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(image.uploaded_at).toLocaleDateString()}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Ready
                    </Badge>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => startAnnotation(image)}
                      className="flex-1 gradient-primary text-white text-xs"
                    >
                      <FileText className="mr-1 h-3 w-3" />
                      Annotate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedImage(image)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ImageIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? 'No images found' : 'No images uploaded'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Upload images to start annotating your dataset'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => navigate(`/projects/${projectId}/upload`)}
                className="gradient-primary text-white"
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Upload Your First Images
              </Button>
            )}
          </div>
        )}

        {/* Image Preview Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">{selectedImage.original_filename}</h3>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedImage(null)}
                >
                  ×
                </Button>
              </div>
              <div className="max-h-[80vh] overflow-auto">
                <img
                  src={getImageUrl(selectedImage)}
                  alt={selectedImage.original_filename}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
