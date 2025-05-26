
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Settings, 
  Play, 
  Trash2, 
  Calendar, 
  ArrowLeft,
  Edit,
  Save,
  X,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { workflowService } from '@/services/workflow';
import { WorkflowResponse, WorkflowStepResponse, JobResponse } from '@/types/workflow';
import { useAuth } from '@/hooks/useAuth';

const WorkflowDetail = () => {
  const { id: workflowId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const [workflow, setWorkflow] = useState<WorkflowResponse | null>(null);
  const [steps, setSteps] = useState<WorkflowStepResponse[]>([]);
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    if (isAuthenticated && workflowId) {
      fetchWorkflowData();
    }
  }, [isAuthenticated, workflowId]);

  const fetchWorkflowData = async () => {
    try {
      setLoading(true);
      
      // Fetch workflow details
      const workflowData = await workflowService.getWorkflow(workflowId!);
      setWorkflow(workflowData);
      setEditForm({ name: workflowData.name, description: workflowData.description || '' });

      // Fetch workflow steps
      const stepsData = await workflowService.getWorkflowSteps(workflowId!);
      setSteps(stepsData);

      // Fetch related jobs
      const jobsData = await workflowService.getJobs(undefined, workflowId);
      setJobs(jobsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch workflow details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWorkflow = async () => {
    try {
      await workflowService.updateWorkflow(workflowId!, editForm);
      setWorkflow(prev => prev ? { ...prev, name: editForm.name, description: editForm.description } : null);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Workflow updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update workflow",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWorkflow = async () => {
    if (!confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) return;

    try {
      await workflowService.deleteWorkflow(workflowId!);
      toast({
        title: "Success",
        description: "Workflow deleted successfully",
      });
      navigate('/workflows');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete workflow",
        variant: "destructive",
      });
    }
  };

  const handleExecuteWorkflow = async () => {
    if (!uploadFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await workflowService.executeJobWithFile(workflowId!, uploadFile);
      toast({
        title: "Success",
        description: "Job created and started successfully",
      });
      setUploadFile(null);
      fetchWorkflowData(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute workflow",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      running: { variant: 'default' as const, icon: Play, color: 'text-blue-600' },
      completed: { variant: 'secondary' as const, icon: CheckCircle, color: 'text-green-600' },
      failed: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6 pt-24">
        <Card className="text-center">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-4">Please log in to access workflow details.</p>
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

  if (!workflow) {
    return (
      <div className="container mx-auto p-6 pt-24">
        <Card className="text-center">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold mb-4">Workflow Not Found</h1>
            <p className="text-gray-600 mb-4">The requested workflow could not be found.</p>
            <Button onClick={() => navigate('/workflows')}>
              Back to Workflows
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/workflows')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workflows
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workflow Details</h1>
            <p className="text-gray-600">Manage your workflow configuration and execution</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <X className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteWorkflow}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Workflow Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Workflow Information
            {isEditing && (
              <Button onClick={handleUpdateWorkflow} size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              {isEditing ? (
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Workflow name"
                />
              ) : (
                <p className="text-gray-900">{workflow.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
              <p className="text-gray-600 flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                {new Date(workflow.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            {isEditing ? (
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Workflow description"
                rows={3}
              />
            ) : (
              <p className="text-gray-600">{workflow.description || 'No description provided'}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Execute Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Execute Workflow</CardTitle>
          <CardDescription>Upload an image to process through this workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
            </div>
            <Button 
              onClick={handleExecuteWorkflow}
              disabled={!uploadFile}
              className="gradient-primary text-white"
            >
              <Upload className="mr-2 h-4 w-4" />
              Execute
            </Button>
          </div>
          {uploadFile && (
            <p className="text-sm text-gray-600 mt-2">
              Selected: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Workflow Steps ({steps.length})
            <Button onClick={() => navigate(`/workflows/${workflowId}/steps/create`)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Step
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {steps.length > 0 ? (
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-medium">
                    {step.step_order}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium">{step.step_type.toUpperCase()}</h3>
                      <Badge variant="outline">{step.model_name}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Created: {new Date(step.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Steps Configured</h3>
              <p className="text-gray-500 mb-4">Add steps to define the workflow processing pipeline</p>
              <Button onClick={() => navigate(`/workflows/${workflowId}/steps/create`)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Step
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Recent Jobs ({jobs.length})
            <Link to="/jobs">
              <Button variant="outline" size="sm">
                View All Jobs
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium">Job #{job.id}</h3>
                      <p className="text-sm text-gray-600">
                        {job.input_image_path} • {new Date(job.created_at).toLocaleDateString()}
                      </p>
                      {job.error_message && (
                        <p className="text-sm text-red-600 mt-1">{job.error_message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(job.status)}
                    <Button variant="outline" size="sm" onClick={() => navigate(`/jobs/${job.id}`)}>
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Jobs Yet</h3>
              <p className="text-gray-500">Execute the workflow to create your first job</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowDetail;
