import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Calendar,
  Images,
  Trash2,
  FolderOpen,
  Bot,
  Eye,
  FileText
} from 'lucide-react';
import { API_CONFIG, STORAGE_KEYS } from '@/lib/constants';

interface Project {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  image_count?: number;
  auto_ai_model_id?: string;
}

interface AIModel {
  id: string;
  name: string;
  description: string;
  type: string;
  confidence_threshold: number;
}

export default function Projects() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('none');
  const [modelsLoading, setModelsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    fetchProjects();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (createDialogOpen) {
      loadModels();
    }
  }, [createDialogOpen]);

  const loadModels = async () => {
    setModelsLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MODELS}`);
      
      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
      }
    } catch (error) {
      console.error('Error loading models:', error);
      toast({
        title: "Warning",
        description: "Failed to load AI models. You can still create a project without auto-labeling.",
        variant: "destructive",
      });
    } finally {
      setModelsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}?limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
            );

      if (response.ok) {
        const data = await response.json();
        console.log('uri', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}?limit=50`);
        console.log('Fetched projects:', data);
        console.log('Fetched projects:', data.projects);
        setProjects(data.projects || []);
      } else {
          console.log('Fetched projects:', response);
        throw new Error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;

    setCreating(true);
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const requestBody: any = { name: newProjectName };
      
      // Add auto AI model if selected (and not "none")
      if (selectedModelId && selectedModelId !== 'none') {
        requestBody.auto_ai_model_id = selectedModelId;
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (response.ok) {
        const newProject = await response.json();
        setProjects([newProject, ...projects]);
        setCreateDialogOpen(false);
        setNewProjectName('');
        setSelectedModelId('none');
        
        const selectedModel = selectedModelId !== 'none' ? models.find(m => m.id === selectedModelId) : null;
        const successMessage = selectedModel 
          ? `Project "${newProjectName}" created with auto-labeling using ${selectedModel.name}!`
          : `Project "${newProjectName}" created successfully!`;
          
        toast({
          title: "Success",
          description: successMessage,
        });
      } else {
        throw new Error('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}/${projectId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId));
        toast({
          title: "Success",
          description: `Project "${projectName}" deleted successfully`,
        });
      } else {
        throw new Error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProjectModelInfo = (project: Project) => {
    if (!project.auto_ai_model_id) return null;
    return models.find(m => m.id === project.auto_ai_model_id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
            <p className="text-gray-600">
              Manage your AI annotation projects and datasets
            </p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Create an annotation project with optional auto-labeling using AI models.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Product Detection Dataset"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && createProject()}
                  />
                </div>

                <div>
                  <Label htmlFor="model">AI Model (Optional)</Label>
                  <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose model for auto-labeling" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center">
                          <span>No auto-labeling</span>
                        </div>
                      </SelectItem>
                      {modelsLoading ? (
                        <SelectItem value="loading" disabled>
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                            Loading models...
                          </div>
                        </SelectItem>
                      ) : (
                        models.map(model => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center space-x-2">
                              {model.type.includes('ocr') ? (
                                <FileText className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Eye className="h-4 w-4 text-green-600" />
                              )}
                              <div>
                                <div className="font-medium">{model.name}</div>
                                <div className="text-xs text-gray-500">{model.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedModelId && selectedModelId !== 'none' && (
                    <p className="text-xs text-blue-600 mt-1 flex items-center">
                      <Bot className="h-3 w-3 mr-1" />
                      Auto-labeling will be applied to uploaded images
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCreateDialogOpen(false);
                    setSelectedModelId('none');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={createProject}
                  disabled={!newProjectName.trim() || creating}
                  className="gradient-primary text-white"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const modelInfo = getProjectModelInfo(project);
              return (
                <Card 
                  key={project.id} 
                  className="border-0 shadow-lg hover-lift cursor-pointer group"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                          <FolderOpen className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                            {project.name}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-500">
                            Created {new Date(project.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProject(project.id, project.name);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {modelInfo && (
                      <div className="mt-2 flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          <Bot className="h-3 w-3 mr-1" />
                          Auto: {modelInfo.name}
                        </Badge>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Images className="h-4 w-4 mr-1" />
                          {project.image_count || 0} images
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(project.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FolderOpen className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Create your first annotation project to get started'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setCreateDialogOpen(true)}
                className="gradient-primary text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
