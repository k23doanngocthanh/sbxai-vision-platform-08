import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
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
    <div className="container mx-auto p-6 pt-24">HI</div>
  );
};

export default Workflows;

