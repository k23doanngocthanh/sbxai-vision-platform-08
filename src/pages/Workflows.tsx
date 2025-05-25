
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Play, Trash2, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { workflowService } from '@/services/workflow';
import { WorkflowResponse } from '@/types/workflow';
import { useAuth } from '@/hooks/useAuth';

const Workflows = () => {
  const [workflows, setWorkflows] = useState<WorkflowResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkflows();
    }
  }, [isAuthenticated]);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const data = await workflowService.getWorkflows();
      setWorkflows(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch workflows",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkflow = async (workflowId: number) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      await workflowService.deleteWorkflow(workflowId.toString());
      toast({
        title: "Success",
        description: "Workflow deleted successfully",
      });
      fetchWorkflows();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete workflow",
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
            <p className="text-gray-600 mb-4">Please log in to access workflows.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 pt-24">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-24 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Workflows</h1>
          <p className="text-gray-600 mt-2">Create and manage your AI processing workflows</p>
        </div>
        <Link to="/workflows/create">
          <Button className="gradient-primary text-white hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </Link>
      </div>

      {workflows.length === 0 ? (
        <Card className="text-center hover-lift">
          <CardContent className="p-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold">No workflows yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Create your first workflow to start automating your AI processing tasks.
              </p>
              <Link to="/workflows/create">
                <Button className="gradient-primary text-white hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Workflow
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="hover-lift border-0 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold mb-1">
                      {workflow.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {workflow.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    ID: {workflow.id}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4 mr-1" />
                  Created {new Date(workflow.created_at).toLocaleDateString()}
                </div>
                
                <div className="flex items-center gap-2">
                  <Link to={`/workflows/${workflow.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </Link>
                  
                  <Link to={`/jobs?workflow=${workflow.id}`}>
                    <Button size="sm" className="gradient-primary text-white">
                      <Play className="w-4 h-4" />
                    </Button>
                  </Link>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteWorkflow(workflow.id)}
                    className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Workflows;
