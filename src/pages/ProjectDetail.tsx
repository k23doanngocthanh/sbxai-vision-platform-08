import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Upload, 
  Image as ImageIcon, 
  Tag,
  Calendar,
  User
} from 'lucide-react';
import { API_CONFIG, STORAGE_KEYS } from '@/lib/constants';

interface Project {
  project_id: string;
  user_id: string;
  name: string;
  created_at: string;
  counts?: {
    projects?: number;
    images?: number;
    annotation_sessions?: number;
    labels?: number; // Optional, in case you want to extend
  };
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (!id) {
      navigate('/projects');
      return;
    }

    fetchProject();
  }, [id, isAuthenticated, navigate]);

  const fetchProject = async () => {
    if (!id) return;

    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const projectData = await response.json();
        setProject(projectData);
      } else {
        throw new Error('Failed to fetch project');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive",
      });
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h1>
          <Button onClick={() => navigate('/projects')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/projects')}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">
              Created on {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Images</CardTitle>
              <ImageIcon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.counts?.images ?? 0}</div>
              <p className="text-xs text-gray-500">Total uploaded</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Labels</CardTitle>
              <Tag className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.counts?.labels ?? 0}</div>
              <p className="text-xs text-gray-500">Created labels</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Sessions</CardTitle>
              <User className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.counts?.annotation_sessions ?? 0}</div>
              <p className="text-xs text-gray-500">Annotation sessions</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <Badge className="gradient-primary text-white border-0">Active</Badge>
              <p className="text-xs text-gray-500 mt-1">In progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            className="border-0 shadow-lg hover-lift cursor-pointer"
            onClick={() => navigate(`/projects/${id}/upload`)}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5 text-blue-600" />
                Upload Images
              </CardTitle>
              <CardDescription>
                Add images to your annotation project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full gradient-primary text-white">
                <Upload className="mr-2 h-4 w-4" />
                Upload Images
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-lg hover-lift cursor-pointer"
            onClick={() => navigate(`/projects/${id}/labels`)}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="mr-2 h-5 w-5 text-green-600" />
                Manage Labels
              </CardTitle>
              <CardDescription>
                Create and organize annotation labels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Tag className="mr-2 h-4 w-4" />
                Manage Labels
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-lg hover-lift cursor-pointer"
            onClick={() => navigate(`/projects/${id}/gallery`)}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="mr-2 h-5 w-5 text-purple-600" />
                View Gallery
              </CardTitle>
              <CardDescription>
                Browse uploaded images and annotations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <ImageIcon className="mr-2 h-4 w-4" />
                View Gallery
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
