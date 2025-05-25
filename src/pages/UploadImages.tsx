import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Upload, 
  X,
  FileImage,
  CheckCircle,
  AlertCircle,
  Bot,
  Eye,
  FileText
} from 'lucide-react';
import { API_CONFIG, STORAGE_KEYS } from '@/lib/constants';

interface Project {
  project_id: string;
  user_id: string;
  name: string;
  created_at: string;
  auto_ai_model_id?: string;
}

interface AIModel {
  id: string;
  name: string;
  description: string;
  type: string;
  confidence_threshold: number;
}

interface UploadFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  error?: string;
  imageId?: string;
}

export default function UploadImages() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [project, setProject] = useState<Project | null>(null);
  const [aiModel, setAiModel] = useState<AIModel | null>(null);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
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
        
        // Load AI model if project has auto-labeling enabled
        if (projectData.auto_ai_model_id) {
          await fetchAIModel(projectData.auto_ai_model_id);
        }
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

  const fetchAIModel = async (modelId: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MODELS}`);
      
      if (response.ok) {
        const data = await response.json();
        const model = data.models?.find((m: AIModel) => m.id === modelId);
        if (model) {
          setAiModel(model);
        }
      }
    } catch (error) {
      console.error('Error fetching AI model:', error);
    }
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadFile[] = Array.from(selectedFiles)
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        status: 'pending',
        progress: 0
      }));

    if (newFiles.length !== selectedFiles.length) {
      toast({
        title: "Warning",
        description: "Only image files are supported",
        variant: "destructive",
      });
    }

    setFiles(prev => [...prev, ...newFiles]);
  };

  const uploadFile = async (uploadFile: UploadFile) => {
    const { file, id } = uploadFile;
    
    try {
      // Update status to uploading
      setFiles(prev => prev.map(f => 
        f.id === id ? { ...f, status: 'uploading', progress: 20 } : f
      ));

      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const formData = new FormData();
      formData.append('files', file); // Changed from 'file' to 'files'

      console.log('Uploading to project:', project?.project_id);
      console.log('Upload URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECT_IMAGES(project?.project_id!)}`);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECT_IMAGES(project?.project_id!)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        }
      );

      console.log('Upload response status:', response.status);
      console.log('Upload response:', response);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Upload response data:', responseData);
        
        // The API might return an array of images or a single image
        const imageData = Array.isArray(responseData) ? responseData[0] : responseData;
        
        // Update progress
        setFiles(prev => prev.map(f => 
          f.id === id ? { ...f, progress: 60, imageId: imageData.id } : f
        ));

        // Run AI prediction if model is available
        if (aiModel && imageData.id) {
          await runAIPrediction(uploadFile, imageData.id);
        } else {
          // Mark as success if no AI processing needed
          setFiles(prev => prev.map(f => 
            f.id === id ? { ...f, status: 'success', progress: 100 } : f
          ));
        }
      } else {
        const errorData = await response.json();
        console.error('Upload error data:', errorData);
        throw new Error(`Upload failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setFiles(prev => prev.map(f => 
        f.id === id ? { 
          ...f, 
          status: 'error', 
          progress: 0,
          error: 'Upload failed'
        } : f
      ));
    }
  };

  const runAIPrediction = async (uploadFile: UploadFile, imageId: string) => {
    if (!aiModel) return;

    try {
      // Update status to processing
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'processing', progress: 80 } : f
      ));

      const formData = new FormData();
      formData.append('file', uploadFile.file);
      formData.append('confidence', aiModel.confidence_threshold.toString());

      // Determine if it's an OCR model or detection model
      const isOCR = aiModel.type.toLowerCase().includes('ocr');
      const endpoint = isOCR 
        ? API_CONFIG.ENDPOINTS.OCR(aiModel.id)
        : API_CONFIG.ENDPOINTS.PREDICT(aiModel.id);

      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const predictionResult = await response.json();
        
        // Create annotation session with the prediction results
        await createAnnotationSession(imageId, predictionResult);
        
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'success', progress: 100 } : f
        ));
      } else {
        throw new Error('AI prediction failed');
      }
    } catch (error) {
      console.error('Error running AI prediction:', error);
      // Still mark as success since upload worked, just AI failed
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { 
          ...f, 
          status: 'success', 
          progress: 100,
          error: 'AI processing failed, but image uploaded successfully'
        } : f
      ));
    }
  };

  const createAnnotationSession = async (imageId: string, predictionResult: any) => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      
      // Create annotation session
      const sessionResponse = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE_SESSIONS(imageId)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            auto_generated: true,
            ai_model_id: aiModel?.id
          })
        }
      );

      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        
        // Add detection results as session items
        if (predictionResult.detections && predictionResult.detections.length > 0) {
          for (const detection of predictionResult.detections) {
            await fetch(
              `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SESSION_ITEMS(sessionData.id)}`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  label: detection.label,
                  confidence: detection.confidence,
                  bbox: detection.bbox,
                  text: detection.text || null,
                  auto_generated: true
                })
              }
            );
          }
        }
      }
    } catch (error) {
      console.error('Error creating annotation session:', error);
    }
  };

  const uploadAllFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    for (const file of pendingFiles) {
      await uploadFile(file);
    }

    toast({
      title: "Upload Complete",
      description: `Successfully processed ${files.length} image(s)${aiModel ? ' with AI auto-labeling' : ''}`,
    });
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'uploading':
      case 'processing':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600" />;
      default:
        return <FileImage className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (file: UploadFile) => {
    switch (file.status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return aiModel ? `Processing with ${aiModel.name}...` : 'Processing...';
      case 'success':
        return file.error || 'Complete';
      case 'error':
        return file.error || 'Failed';
      default:
        return 'Ready';
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
            onClick={() => navigate(`/projects/${id}`)}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">Upload images to your annotation project</p>
            {aiModel && (
              <div className="flex items-center mt-2">
                <Badge variant="secondary" className="flex items-center">
                  <Bot className="h-3 w-3 mr-1" />
                  Auto-labeling with {aiModel.name}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Upload Images
              </CardTitle>
              <CardDescription>
                {aiModel 
                  ? `Images will be automatically labeled using ${aiModel.name}`
                  : 'Drag and drop images or click to select files'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging 
                    ? 'border-purple-400 bg-purple-50' 
                    : 'border-gray-300 hover:border-purple-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Drop images here
                </h3>
                <p className="text-gray-600 mb-4">
                  or click to browse files
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  Select Images
                </Button>
              </div>

              {files.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Files ({files.length})</h4>
                    <Button
                      onClick={uploadAllFiles}
                      disabled={files.every(f => f.status !== 'pending')}
                      className="gradient-primary text-white"
                    >
                      Upload All
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {getStatusIcon(file.status)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {file.file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getStatusText(file)} • {(file.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          {file.progress > 0 && file.status !== 'success' && file.status !== 'error' && (
                            <Progress value={file.progress} className="mt-1" />
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          disabled={file.status === 'uploading' || file.status === 'processing'}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Upload Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-purple-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Select Images</h4>
                    <p className="text-sm text-gray-600">
                      Choose image files (JPG, PNG, etc.) from your device
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-purple-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Automatic Processing</h4>
                    <p className="text-sm text-gray-600">
                      {aiModel 
                        ? `Images will be automatically analyzed using ${aiModel.name} for detection and labeling`
                        : 'Images will be uploaded to your project for manual annotation'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-purple-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Review Results</h4>
                    <p className="text-sm text-gray-600">
                      {aiModel 
                        ? 'Review and refine the automatically generated annotations in the gallery'
                        : 'Start annotating your images using the annotation tool'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {aiModel && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    {aiModel.type.toLowerCase().includes('ocr') ? (
                      <FileText className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-blue-600" />
                    )}
                    <h4 className="font-medium text-blue-900">AI Model Info</h4>
                  </div>
                  <p className="text-sm text-blue-800">{aiModel.description}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Confidence threshold: {(aiModel.confidence_threshold * 100).toFixed(0)}%
                  </p>
                </div>
              )}

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Supported Formats</h4>
                <div className="flex flex-wrap gap-2">
                  {['JPG', 'PNG', 'JPEG', 'WEBP', 'GIF'].map(format => (
                    <Badge key={format} variant="outline" className="text-xs">
                      {format}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
