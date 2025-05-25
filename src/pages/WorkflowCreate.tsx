
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { workflowService } from '@/services/workflow';
import { WorkflowCreateRequest } from '@/types/workflow';

const WorkflowCreate = () => {
  const [formData, setFormData] = useState<WorkflowCreateRequest>({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Workflow name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const workflow = await workflowService.createWorkflow(formData);
      toast({
        title: "Success",
        description: "Workflow created successfully",
      });
      navigate(`/workflows/${workflow.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create workflow",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 pt-24 max-w-2xl animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/workflows')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Workflows
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gradient">Create Workflow</h1>
          <p className="text-gray-600 mt-1">Set up a new AI processing workflow</p>
        </div>
      </div>

      <Card className="hover-lift border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Workflow Details</CardTitle>
          <CardDescription>
            Provide basic information about your workflow
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Workflow Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter workflow name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this workflow does..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full resize-none"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => navigate('/workflows')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 gradient-primary text-white hover:opacity-90"
              >
                {loading ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Workflow
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowCreate;
