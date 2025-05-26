
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { workflowService } from '@/services/workflow';
import { ModelManagementResponse, StepType } from '@/types/workflow';
import { useAuth } from '@/hooks/useAuth';

const WorkflowStepCreate = () => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<ModelManagementResponse[]>([]);
  const [formData, setFormData] = useState({
    step_order: 1,
    step_type: 'detect' as StepType,
    model_name: '',
    config_json: '{}'
  });

  const stepTypes: { value: StepType; label: string; description: string }[] = [
    { value: 'detect', label: 'Object Detection', description: 'Detect objects in images' },
    { value: 'crop', label: 'Image Cropping', description: 'Crop detected regions' },
    { value: 'ocr', label: 'Text Recognition', description: 'Extract text from images' },
    { value: 'other', label: 'Custom Processing', description: 'Other custom processing steps' }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchModels();
    }
  }, [isAuthenticated, formData.step_type]);

  const fetchModels = async () => {
    try {
      const modelsData = await workflowService.getModels(formData.step_type);
      setModels(modelsData);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workflowId) {
      toast({
        title: "Error",
        description: "Workflow ID is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Validate JSON config
      let configJson;
      try {
        configJson = JSON.parse(formData.config_json);
      } catch {
        toast({
          title: "Error",
          description: "Invalid JSON configuration",
          variant: "destructive",
        });
        return;
      }

      await workflowService.createWorkflowStep(workflowId, {
        step_order: formData.step_order,
        step_type: formData.step_type,
        model_name: formData.model_name,
        config_json: configJson
      });

      toast({
        title: "Success",
        description: "Workflow step created successfully",
      });

      navigate(`/workflows/${workflowId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create workflow step",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (value: string) => {
    setFormData(prev => ({ ...prev, config_json: value }));
  };

  const formatJsonConfig = () => {
    try {
      const parsed = JSON.parse(formData.config_json);
      const formatted = JSON.stringify(parsed, null, 2);
      setFormData(prev => ({ ...prev, config_json: formatted }));
    } catch {
      toast({
        title: "Warning",
        description: "Invalid JSON format",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6 pt-24">
        <Card className="text-center">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-4">Please log in to create workflow steps.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-24 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate(`/workflows/${workflowId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Workflow
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Workflow Step</h1>
          <p className="text-gray-600">Add a new processing step to your workflow</p>
        </div>
      </div>

      {/* Create Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Step Configuration
          </CardTitle>
          <CardDescription>
            Configure the processing step and select the appropriate model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step Order */}
            <div className="space-y-2">
              <Label htmlFor="step_order">Step Order</Label>
              <Input
                id="step_order"
                type="number"
                min="1"
                value={formData.step_order}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  step_order: parseInt(e.target.value) || 1 
                }))}
                placeholder="Enter step order (1, 2, 3...)"
                required
              />
            </div>

            {/* Step Type */}
            <div className="space-y-2">
              <Label htmlFor="step_type">Step Type</Label>
              <Select
                value={formData.step_type}
                onValueChange={(value: StepType) => setFormData(prev => ({ 
                  ...prev, 
                  step_type: value,
                  model_name: '' // Reset model when type changes
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select step type" />
                </SelectTrigger>
                <SelectContent>
                  {stepTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model_name">Model</Label>
              <Select
                value={formData.model_name}
                onValueChange={(value) => setFormData(prev => ({ ...prev, model_name: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {models.length > 0 ? (
                    models.map((model) => (
                      <SelectItem key={model.id} value={model.name}>
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-sm text-gray-500">
                            {model.version && `v${model.version} • `}
                            {model.type}
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-models" disabled>
                      No models available for this step type
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Configuration JSON */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="config_json">Configuration (JSON)</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={formatJsonConfig}
                >
                  Format JSON
                </Button>
              </div>
              <Textarea
                id="config_json"
                value={formData.config_json}
                onChange={(e) => handleConfigChange(e.target.value)}
                placeholder="Enter JSON configuration for this step"
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-sm text-gray-500">
                Optional configuration parameters in JSON format. Leave as {`{}`} if no special configuration is needed.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-2">
              <Button 
                type="submit" 
                disabled={loading || !formData.model_name}
                className="gradient-primary text-white"
              >
                {loading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Create Step
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate(`/workflows/${workflowId}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Step Types Info */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Step Types Information</CardTitle>
          <CardDescription>
            Learn about different types of processing steps available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stepTypes.map((type) => (
              <div key={type.value} className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-medium text-gray-900">{type.label}</h3>
                <p className="text-sm text-gray-600">{type.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowStepCreate;
