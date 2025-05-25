
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Calendar, Image, AlertCircle, CheckCircle, Clock, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { workflowService } from '@/services/workflow';
import { JobResponse, JobStatus } from '@/types/workflow';
import { useAuth } from '@/hooks/useAuth';

const Jobs = () => {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const statusFilter = searchParams.get('status') as JobStatus | null;
  const workflowFilter = searchParams.get('workflow') || undefined;

  useEffect(() => {
    if (isAuthenticated) {
      fetchJobs();
    }
  }, [isAuthenticated, statusFilter, workflowFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await workflowService.getJobs(statusFilter || undefined, workflowFilter, 50);
      setJobs(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status === 'all') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    setSearchParams(params);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'running':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6 pt-24">
        <Card className="text-center">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-4">Please log in to access jobs.</p>
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
          <h1 className="text-3xl font-bold text-gradient">Jobs</h1>
          <p className="text-gray-600 mt-2">Monitor your AI processing jobs</p>
        </div>
        <Link to="/workflows">
          <Button className="gradient-primary text-white hover:opacity-90">
            <Upload className="w-4 h-4 mr-2" />
            Execute New Job
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 items-center">
        <Select value={statusFilter || 'all'} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        
        {workflowFilter && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Workflow: {workflowFilter}
          </Badge>
        )}
      </div>

      {jobs.length === 0 ? (
        <Card className="text-center hover-lift">
          <CardContent className="p-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Image className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold">No jobs found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {statusFilter ? `No jobs with status "${statusFilter}" found.` : 'No processing jobs have been created yet.'}
              </p>
              <Link to="/workflows">
                <Button className="gradient-primary text-white hover:opacity-90">
                  <Upload className="w-4 h-4 mr-2" />
                  Execute Your First Job
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover-lift border-0 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg font-semibold">
                        Job #{job.id}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.status)}
                        <Badge className={getStatusColor(job.status)}>
                          {job.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-sm text-gray-600">
                      Input: {job.input_image_path}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    {job.workflow_id && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 mb-2">
                        Workflow: {job.workflow_id}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    Created {new Date(job.created_at).toLocaleDateString()} at {new Date(job.created_at).toLocaleTimeString()}
                  </div>
                  
                  <Link to={`/jobs/${job.id}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </div>

                {job.error_message && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{job.error_message}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Jobs;
