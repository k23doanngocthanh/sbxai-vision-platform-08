
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Save, Settings, Zap, Database, FileText, Cpu, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { workflowService } from '@/services/workflow';
import { ModelManagementResponse, StepType } from '@/types/workflow';
import { useAuth } from '@/hooks/useAuth';

interface JsonKeyValue {
  id: string;
  key: string;
  value: string;
}

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
  });

  const [jsonKeyValues, setJsonKeyValues] = useState<JsonKeyValue[]>([
    { id: '1', key: '', value: '' }
  ]);

  const stepTypes: { value: StepType; label: string; description: string; icon: any; color: string }[] = [
    { 
      value: 'detect', 
      label: 'Object Detection', 
      description: 'Detect and identify objects in images using AI models',
      icon: Zap,
      color: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    { 
      value: 'crop', 
      label: 'Image Cropping', 
      description: 'Extract and crop specific regions from detected objects',
      icon: Database,
      color: 'bg-green-50 border-green-200 text-green-700'
    },
    { 
      value: 'ocr', 
      label: 'Text Recognition', 
      description: 'Extract and recognize text content from images',
      icon: FileText,
      color: 'bg-purple-50 border-purple-200 text-purple-700'
    },
    { 
      value: 'other', 
      label: 'Custom Processing', 
      description: 'Custom image processing and transformation steps',
      icon: Cpu,
      color: 'bg-orange-50 border-orange-200 text-orange-700'
    }
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

  const addJsonKeyValue = () => {
    const newId = Date.now().toString();
    setJsonKeyValues([...jsonKeyValues, { id: newId, key: '', value: '' }]);
  };

  const removeJsonKeyValue = (id: string) => {
    if (jsonKeyValues.length > 1) {
      setJsonKeyValues(jsonKeyValues.filter(item => item.id !== id));
    }
  };

  const updateJsonKeyValue = (id: string, field: 'key' | 'value', newValue: string) => {
    setJsonKeyValues(jsonKeyValues.map(item => 
      item.id === id ? { ...item, [field]: newValue } : item
    ));
  };

  const buildJsonFromKeyValues = () => {
    const result: Record<string, any> = {};
    jsonKeyValues.forEach(item => {
      if (item.key.trim()) {
        // Try to parse value as JSON, fallback to string
        try {
          result[item.key] = JSON.parse(item.value);
        } catch {
          result[item.key] = item.value;
        }
      }
    });
    return result;
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

    if (!formData.model_name) {
      toast({
        title: "Error",
        description: "Please select a model",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const configJson = buildJsonFromKeyValues();

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 pt-24">
        <Card className="max-w-md mx-auto text-center shadow-xl">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
            <p className="text-gray-600">Please log in to create workflow steps.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Fixed Header */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/workflows/${workflowId}`)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Workflow
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Step</h1>
              <p className="text-gray-600 text-sm">Configure a new processing step for your workflow</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline"
              onClick={() => navigate(`/workflows/${workflowId}`)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading || !formData.model_name}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Step
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-8">
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          {/* Step Type Selection */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Zap className="mr-2 h-5 w-5 text-blue-600" />
                Step Type
              </CardTitle>
              <CardDescription>
                Choose the type of processing this step will perform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stepTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.step_type === type.value;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        step_type: type.value,
                        model_name: ''
                      }))}
                      className={`
                        p-4 rounded-lg border-2 text-left transition-all hover:shadow-md
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`
                          w-10 h-10 rounded-lg flex items-center justify-center
                          ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}
                        `}>
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                            {type.label}
                          </h3>
                          <p className={`text-sm mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Settings */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Settings className="mr-2 h-5 w-5 text-green-600" />
                  Basic Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    The execution order of this step in the workflow
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model_name">AI Model</Label>
                  <Select
                    value={formData.model_name}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, model_name: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.length > 0 ? (
                        models.map((model) => (
                          <SelectItem key={model.id} value={model.name}>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <div>
                                <div className="font-medium">{model.name}</div>
                                <div className="text-xs text-gray-500">
                                  {model.type} • {model.version && `v${model.version}`}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-models" disabled>
                          No models available for {formData.step_type}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Configuration Editor */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="mr-2 h-5 w-5 text-purple-600" />
                  Model Configuration
                </CardTitle>
                <CardDescription>
                  Configure model parameters using key-value pairs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {jsonKeyValues.map((item, index) => (
                    <div key={item.id} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Key"
                          value={item.key}
                          onChange={(e) => updateJsonKeyValue(item.id, 'key', e.target.value)}
                          className="text-sm"
                        />
                        <Input
                          placeholder="Value"
                          value={item.value}
                          onChange={(e) => updateJsonKeyValue(item.id, 'value', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeJsonKeyValue(item.id)}
                        disabled={jsonKeyValues.length <= 1}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={addJsonKeyValue}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Parameter
                </Button>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 mb-2 font-medium">Preview JSON:</p>
                  <pre className="text-xs text-blue-800 overflow-auto max-h-32">
                    {JSON.stringify(buildJsonFromKeyValues(), null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowStepCreate;
