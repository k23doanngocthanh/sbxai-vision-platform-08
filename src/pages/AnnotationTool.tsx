import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Save, 
  Trash2,
  Square,
  Pentagon,
  Type,
  MousePointer,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { API_CONFIG, STORAGE_KEYS } from '@/lib/constants';

interface Label {
  id: number;
  name: string;
  color: string;
  expected_format: 'bbox' | 'polygon' | 'text';
}

interface Annotation {
  id?: number;
  label_id: number;
  bbox?: { x: number; y: number; width: number; height: number };
  polygon?: { x: number; y: number }[];
  text?: string;
  confidence?: number;
}

interface ImageData {
  id: string;
  file_path: string;
  original_filename: string;
  image_width: number;
  image_height: number;
}

const TOOLS = {
  SELECT: 'select',
  BBOX: 'bbox',
  POLYGON: 'polygon',
  TEXT: 'text'
} as const;

type Tool = typeof TOOLS[keyof typeof TOOLS];

export default function AnnotationTool() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const imageId = searchParams.get('imageId');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<ImageData | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>(TOOLS.SELECT);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [scale, setScale] = useState(1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageBlob, setImageBlob] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !projectId || !imageId) {
      navigate('/projects');
      return;
    }

    loadData();
  }, [isAuthenticated, projectId, imageId, navigate]);

  const loadData = async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      
      // Load labels
      const labelsResponse = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECT_LABELS(projectId!)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (labelsResponse.ok) {
        const labelsData = await labelsResponse.json();
        setLabels(labelsData.labels || []);
      }

      // Load project images to get image info
      const imagesResponse = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECT_IMAGES(projectId!)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (imagesResponse.ok) {
        const imagesData = await imagesResponse.json();
        const imageInfo = imagesData.images?.find((img: any) => img.id === imageId);
        
        if (imageInfo) {
          // Create a dummy URL since we can't access the actual file
          const dummyUrl = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=`;
          
          setImage({
            id: imageId!,
            file_path: dummyUrl,
            original_filename: imageInfo.original_filename || 'image.jpg',
            image_width: imageInfo.image_width || 640,
            image_height: imageInfo.image_height || 640
          });
        }
      }

      // Create or get annotation session
      const sessionData = new FormData();
      sessionData.append('source', 'manual');
      
      const sessionResponse = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE_SESSIONS(imageId!)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: sessionData
        }
      );

      if (sessionResponse.ok) {
        const session = await sessionResponse.json();
        setSessionId(session.session_id);
        
        // Load existing annotations
        const itemsResponse = await fetch(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SESSION_ITEMS(session.session_id)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (itemsResponse.ok) {
          const itemsData = await itemsResponse.json();
          setAnnotations(itemsData.items || []);
        }
      }
    } catch (error) {
      console.error('Error loading annotation data:', error);
      toast({
        title: "Error",
        description: "Failed to load annotation data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const drawCanvas = useCallback(() => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on image dimensions
    canvas.width = image.image_width * scale;
    canvas.height = image.image_height * scale;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw a placeholder background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid pattern
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    const gridSize = 20 * scale;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw annotations
    annotations.forEach(annotation => {
      const label = labels.find(l => l.id === annotation.label_id);
      if (!label) return;

      ctx.strokeStyle = label.color;
      ctx.fillStyle = label.color + '33';
      ctx.lineWidth = 2;

      if (annotation.bbox) {
        const { x, y, width, height } = annotation.bbox;
        ctx.strokeRect(x * scale, y * scale, width * scale, height * scale);
        ctx.fillRect(x * scale, y * scale, width * scale, height * scale);
        
        // Draw label text
        ctx.fillStyle = label.color;
        ctx.font = '14px Arial';
        ctx.fillText(label.name, x * scale, y * scale - 5);
      }

      if (annotation.polygon) {
        ctx.beginPath();
        annotation.polygon.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x * scale, point.y * scale);
          } else {
            ctx.lineTo(point.x * scale, point.y * scale);
          }
        });
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
      }
    });

    // Draw current annotation being created
    if (currentAnnotation) {
      const label = labels.find(l => l.id === currentAnnotation.label_id);
      if (label) {
        ctx.strokeStyle = label.color;
        ctx.fillStyle = label.color + '33';
        ctx.lineWidth = 2;

        if (currentAnnotation.bbox) {
          const { x, y, width, height } = currentAnnotation.bbox;
          ctx.strokeRect(x * scale, y * scale, width * scale, height * scale);
          ctx.fillRect(x * scale, y * scale, width * scale, height * scale);
        }
      }
    }
  }, [image, annotations, currentAnnotation, labels, scale]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedLabel || selectedTool === TOOLS.SELECT) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (selectedTool === TOOLS.BBOX) {
      setIsDrawing(true);
      setCurrentAnnotation({
        label_id: selectedLabel.id,
        bbox: { x, y, width: 0, height: 0 }
      });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAnnotation || selectedTool !== TOOLS.BBOX) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) / scale;
    const currentY = (e.clientY - rect.top) / scale;

    if (currentAnnotation.bbox) {
      const startX = currentAnnotation.bbox.x;
      const startY = currentAnnotation.bbox.y;
      
      setCurrentAnnotation({
        ...currentAnnotation,
        bbox: {
          x: Math.min(startX, currentX),
          y: Math.min(startY, currentY),
          width: Math.abs(currentX - startX),
          height: Math.abs(currentY - startY)
        }
      });
    }
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing || !currentAnnotation) return;

    setIsDrawing(false);
    
    // Save annotation if it has valid dimensions
    if (currentAnnotation.bbox && 
        currentAnnotation.bbox.width > 5 && 
        currentAnnotation.bbox.height > 5) {
      saveAnnotation(currentAnnotation);
    }
    
    setCurrentAnnotation(null);
  };

  const saveAnnotation = async (annotation: Annotation) => {
    if (!sessionId) return;

    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const formData = new FormData();
      
      formData.append('label_id', annotation.label_id.toString());
      
      if (annotation.bbox) {
        formData.append('bbox', JSON.stringify(annotation.bbox));
      }
      
      if (annotation.polygon) {
        formData.append('polygon', JSON.stringify(annotation.polygon));
      }
      
      if (annotation.text) {
        formData.append('text', annotation.text);
      }
      
      formData.append('confidence', '1.0');

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SESSION_ITEMS(sessionId)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        }
      );

      if (response.ok) {
        setAnnotations([...annotations, { ...annotation, id: Date.now() }]);
        toast({
          title: "Success",
          description: "Annotation saved successfully",
        });
      }
    } catch (error) {
      console.error('Error saving annotation:', error);
      toast({
        title: "Error",
        description: "Failed to save annotation",
        variant: "destructive",
      });
    }
  };

  const deleteAnnotation = (index: number) => {
    const newAnnotations = annotations.filter((_, i) => i !== index);
    setAnnotations(newAnnotations);
    toast({
      title: "Success",
      description: "Annotation deleted",
    });
  };

  const getToolIcon = (tool: Tool) => {
    switch (tool) {
      case TOOLS.SELECT: return MousePointer;
      case TOOLS.BBOX: return Square;
      case TOOLS.POLYGON: return Pentagon;
      case TOOLS.TEXT: return Type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading annotation tool...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/projects/${projectId}/gallery`)}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Gallery
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Annotation Tool</h1>
              <p className="text-gray-600">{image?.original_filename}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setScale(Math.max(0.1, scale - 0.1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
            <Button
              variant="outline"
              onClick={() => setScale(Math.min(3, scale + 0.1))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setScale(1)}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tools Panel */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.values(TOOLS).map((tool) => {
                const Icon = getToolIcon(tool);
                return (
                  <Button
                    key={tool}
                    variant={selectedTool === tool ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedTool(tool)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {tool.charAt(0).toUpperCase() + tool.slice(1)}
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Canvas Area */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="border rounded-lg overflow-auto max-h-[600px]">
                  {image && (
                    <canvas
                      ref={canvasRef}
                      className="cursor-crosshair"
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                    />
                  )}
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Image display is currently using a placeholder. 
                    The annotation functionality works with the actual image dimensions ({image?.image_width} × {image?.image_height}).
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Labels & Annotations Panel */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Labels & Annotations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Labels */}
              <div>
                <h4 className="font-medium mb-2">Select Label</h4>
                <div className="space-y-2">
                  {labels.length > 0 ? (
                    labels.map((label) => (
                      <Button
                        key={label.id}
                        variant={selectedLabel?.id === label.id ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setSelectedLabel(label)}
                      >
                        <div 
                          className="w-4 h-4 rounded mr-2"
                          style={{ backgroundColor: label.color }}
                        />
                        {label.name}
                      </Button>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 mb-2">No labels found</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/projects/${projectId}/labels`)}
                      >
                        Create Labels
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Annotations List */}
              <div>
                <h4 className="font-medium mb-2">Annotations ({annotations.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {annotations.map((annotation, index) => {
                    const label = labels.find(l => l.id === annotation.label_id);
                    return (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded mr-2"
                            style={{ backgroundColor: label?.color || '#gray' }}
                          />
                          <span className="text-sm">{label?.name || 'Unknown'}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAnnotation(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
