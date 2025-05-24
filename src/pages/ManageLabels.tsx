
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Plus, 
  Tag,
  Trash2,
  Edit,
  Square,
  Pentagon,
  Type
} from 'lucide-react';
import { API_CONFIG, STORAGE_KEYS } from '@/lib/constants';

interface ProjectLabel {
  id: number;
  project_id: string;
  name: string;
  description?: string;
  expected_format: 'bbox' | 'polygon' | 'text';
  color: string;
  created_at: string;
}

const FORMAT_OPTIONS = [
  { value: 'bbox', label: 'Bounding Box', icon: Square, description: 'Rectangular boxes around objects' },
  { value: 'polygon', label: 'Polygon', icon: Pentagon, description: 'Custom shape annotations' },
  { value: 'text', label: 'Text', icon: Type, description: 'Text-based annotations' }
];

const COLOR_PRESETS = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#FFA500', '#800080', '#FFC0CB', '#A52A2A', '#808080', '#000000'
];

export default function ManageLabels() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [labels, setLabels] = useState<ProjectLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<ProjectLabel | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    expected_format: 'bbox' as 'bbox' | 'polygon' | 'text',
    color: '#FF0000'
  });

  useEffect(() => {
    if (!isAuthenticated || !projectId) {
      navigate('/projects');
      return;
    }

    fetchLabels();
  }, [isAuthenticated, projectId, navigate]);

  const fetchLabels = async () => {
    if (!projectId) return;

    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECT_LABELS(projectId)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLabels(data.labels || []);
      } else {
        throw new Error('Failed to fetch labels');
      }
    } catch (error) {
      console.error('Error fetching labels:', error);
      toast({
        title: "Error",
        description: "Failed to load labels",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createLabel = async () => {
    if (!formData.name.trim() || !projectId) return;

    setCreating(true);
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECT_LABELS(projectId)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      if (response.ok) {
        const newLabel = await response.json();
        setLabels([...labels, newLabel]);
        setCreateDialogOpen(false);
        resetForm();
        toast({
          title: "Success",
          description: `Label "${formData.name}" created successfully!`,
        });
      } else {
        throw new Error('Failed to create label');
      }
    } catch (error) {
      console.error('Error creating label:', error);
      toast({
        title: "Error",
        description: "Failed to create label",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteLabel = async (labelId: number, labelName: string) => {
    if (!confirm(`Are you sure you want to delete "${labelName}"?`)) return;

    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECT_LABELS(projectId!)}/${labelId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (response.ok) {
        setLabels(labels.filter(l => l.id !== labelId));
        toast({
          title: "Success",
          description: `Label "${labelName}" deleted successfully`,
        });
      } else {
        throw new Error('Failed to delete label');
      }
    } catch (error) {
      console.error('Error deleting label:', error);
      toast({
        title: "Error",
        description: "Failed to delete label",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (label: ProjectLabel) => {
    setSelectedLabel(label);
    setFormData({
      name: label.name,
      description: label.description || '',
      expected_format: label.expected_format,
      color: label.color
    });
    setEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      expected_format: 'bbox',
      color: '#FF0000'
    });
  };

  const getFormatIcon = (format: string) => {
    const option = FORMAT_OPTIONS.find(opt => opt.value === format);
    if (!option) return <Tag className="h-4 w-4" />;
    const Icon = option.icon;
    return <Icon className="h-4 w-4" />;
  };

  const getFormatLabel = (format: string) => {
    const option = FORMAT_OPTIONS.find(opt => opt.value === format);
    return option?.label || format;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading labels...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Manage Labels</h1>
              <p className="text-gray-600">
                Create and organize annotation labels for your project
              </p>
            </div>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" />
                New Label
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Create New Label</DialogTitle>
                <DialogDescription>
                  Define a new annotation label for your project.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Label Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Person, Car, Building"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="Describe this label..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="format">Annotation Format</Label>
                  <Select value={formData.expected_format} onValueChange={(value: any) => setFormData(prev => ({ ...prev, expected_format: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAT_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center space-x-2">
                            <option.icon className="h-4 w-4" />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="color">Label Color</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <div className="flex flex-wrap gap-1">
                      {COLOR_PRESETS.map(color => (
                        <button
                          key={color}
                          className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500"
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={createLabel}
                  disabled={!formData.name.trim() || creating}
                  className="gradient-primary text-white"
                >
                  {creating ? 'Creating...' : 'Create Label'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Labels Grid */}
        {labels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labels.map((label) => (
              <Card key={label.id} className="border-0 shadow-lg hover-lift">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: label.color }}
                      />
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {label.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-500">
                          {label.description || 'No description'}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      {getFormatIcon(label.expected_format)}
                      <span>{getFormatLabel(label.expected_format)}</span>
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(label.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(label)}
                      className="flex-1"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteLabel(label.id, label.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Tag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No labels yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first annotation label to get started
            </p>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="gradient-primary text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Label
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
