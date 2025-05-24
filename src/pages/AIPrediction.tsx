import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Upload, 
  Eye,
  FileText,
  Cpu,
  Image as ImageIcon,
  Download,
  Copy
} from 'lucide-react';
import { API_CONFIG } from '@/lib/constants';

interface AIModel {
  id: string;
  name: string;
  description: string;
  type: string;
  confidence_threshold: number;
}

interface Detection {
  class_id: number;
  class_name: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  text?: string;
}

interface PredictionResult {
  detections: Detection[];
  model_info: {
    id: string;
    name: string;
    confidence_threshold: number;
  };
  processing_time_ms: number;
}

export default function AIPrediction() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0.25);
  const [isProcessing, setIsProcessing] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'detection' | 'ocr'>('detection');
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MODELS}`);
      
      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
        if (data.models?.length > 0) {
          setSelectedModel(data.models[0]);
        }
      }
    } catch (error) {
      console.error('Error loading models:', error);
      toast({
        title: "Error",
        description: "Failed to load AI models",
        variant: "destructive",
      });
    } finally {
      setModelsLoaded(true);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setPredictionResult(null);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
    }
  };

  const runPrediction = async (isOCR: boolean = false) => {
    if (!selectedFile || !selectedModel) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('confidence', confidence.toString());

      const endpoint = isOCR 
        ? API_CONFIG.ENDPOINTS.OCR(selectedModel.id)
        : API_CONFIG.ENDPOINTS.PREDICT(selectedModel.id);

      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setPredictionResult(result);
        drawDetections(result.detections);
        
        toast({
          title: "Success",
          description: `${isOCR ? 'OCR' : 'Detection'} completed in ${result.processing_time_ms}ms`,
        });
      } else {
        throw new Error(`${isOCR ? 'OCR' : 'Prediction'} failed`);
      }
    } catch (error) {
      console.error('Error running prediction:', error);
      toast({
        title: "Error",
        description: `Failed to run ${isOCR ? 'OCR' : 'prediction'}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#22c55e'; // Green - High confidence
    if (confidence >= 0.6) return '#3b82f6'; // Blue - Medium-high confidence
    if (confidence >= 0.4) return '#f59e0b'; // Orange - Medium confidence
    if (confidence >= 0.2) return '#ef4444'; // Red - Low confidence
    return '#6b7280'; // Gray - Very low confidence
  };

  const drawDetections = (detections: Detection[]) => {
    if (!canvasRef.current || !imagePreview) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image
      ctx.drawImage(img, 0, 0);

      // Draw detections with color-coded confidence
      detections.forEach((detection) => {
        const { bbox, class_name, confidence } = detection;
        const color = getConfidenceColor(confidence);
        
        ctx.strokeStyle = color;
        ctx.fillStyle = color + '40'; // Semi-transparent fill
        ctx.lineWidth = 3;

        // Draw semi-transparent bounding box
        ctx.fillRect(bbox.x, bbox.y, bbox.width, bbox.height);
        ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);

        // Draw label background
        ctx.font = 'bold 16px Arial';
        const label = `${class_name} ${(confidence * 100).toFixed(1)}%`;
        const textMetrics = ctx.measureText(label);
        const textWidth = textMetrics.width;
        const textHeight = 20;
        
        // Label background
        ctx.fillStyle = color;
        ctx.fillRect(bbox.x, bbox.y - textHeight - 5, textWidth + 10, textHeight + 5);
        
        // Label text
        ctx.fillStyle = 'white';
        ctx.fillText(label, bbox.x + 5, bbox.y - 8);

        // Draw OCR text if available
        if (detection.text) {
          ctx.fillStyle = color;
          ctx.font = '14px Arial';
          const textLines = detection.text.split('\n');
          textLines.forEach((line, index) => {
            ctx.fillText(line, bbox.x, bbox.y + bbox.height + 20 + (index * 18));
          });
        }

        // Draw confidence indicator (small circle)
        const circleX = bbox.x + bbox.width - 15;
        const circleY = bbox.y + 15;
        ctx.beginPath();
        ctx.arc(circleX, circleY, 8, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    };
    img.src = imagePreview;
  };

  const exportResults = () => {
    if (!predictionResult) return;

    const dataStr = JSON.stringify(predictionResult, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `prediction_results_${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const copyResults = () => {
    if (!predictionResult) return;

    navigator.clipboard.writeText(JSON.stringify(predictionResult, null, 2));
    toast({
      title: "Copied",
      description: "Results copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/models')}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Models
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Prediction & OCR</h1>
            <p className="text-gray-600">
              Upload an image and run AI detection or OCR analysis
            </p>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex space-x-4 mb-6">
          <Button
            variant={activeTab === 'detection' ? 'default' : 'outline'}
            onClick={() => setActiveTab('detection')}
            className="flex items-center"
          >
            <Eye className="mr-2 h-4 w-4" />
            Object Detection
          </Button>
          <Button
            variant={activeTab === 'ocr' ? 'default' : 'outline'}
            onClick={() => setActiveTab('ocr')}
            className="flex items-center"
          >
            <FileText className="mr-2 h-4 w-4" />
            OCR Analysis
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cpu className="mr-2 h-5 w-5" />
                Configuration
              </CardTitle>
              <CardDescription>
                Configure AI model and parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Model Selection */}
              <div>
                <Label htmlFor="model">AI Model</Label>
                <Select 
                  value={selectedModel?.id || ''} 
                  onValueChange={(value) => {
                    const model = models.find(m => m.id === value);
                    setSelectedModel(model || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-sm text-gray-500">{model.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Confidence Threshold */}
              <div>
                <Label htmlFor="confidence">
                  Confidence Threshold: {(confidence * 100).toFixed(0)}%
                </Label>
                <Input
                  id="confidence"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={confidence}
                  onChange={(e) => setConfidence(parseFloat(e.target.value))}
                  className="mt-2"
                />
              </div>

              {/* File Upload */}
              <div>
                <Label htmlFor="file">Upload Image</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="mt-2"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={() => runPrediction(activeTab === 'ocr')}
                  disabled={!selectedFile || !selectedModel || isProcessing}
                  className="w-full gradient-primary text-white"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {activeTab === 'detection' ? <Eye className="mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}
                      Run {activeTab === 'detection' ? 'Detection' : 'OCR'}
                    </>
                  )}
                </Button>

                {predictionResult && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={exportResults}
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button
                      variant="outline"
                      onClick={copyResults}
                      className="flex-1"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                )}
              </div>

              {/* Model Info */}
              {selectedModel && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Model Information</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>Type: {selectedModel.type}</div>
                    <div>Default Threshold: {(selectedModel.confidence_threshold * 100).toFixed(0)}%</div>
                  </div>
                </div>
              )}

              {/* Confidence Legend */}
              {predictionResult && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Confidence Legend</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                      <span>High (80%+)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                      <span>Medium-High (60-80%)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
                      <span>Medium (40-60%)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                      <span>Low (20-40%)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-500 rounded mr-2"></div>
                      <span>Very Low (&lt;20%)</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image & Results */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Image & Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {imagePreview ? (
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        className="max-w-full h-auto"
                      />
                    </div>

                    {predictionResult && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Results</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">
                              {predictionResult.detections.length} detections
                            </Badge>
                            <Badge variant="outline">
                              {predictionResult.processing_time_ms}ms
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {predictionResult.detections.map((detection, index) => {
                            const confidenceColor = getConfidenceColor(detection.confidence);
                            return (
                              <div key={index} className="p-3 bg-gray-50 rounded-lg border-l-4" 
                                   style={{ borderLeftColor: confidenceColor }}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">{detection.class_name}</span>
                                  <Badge style={{ backgroundColor: confidenceColor, color: 'white' }}>
                                    {(detection.confidence * 100).toFixed(1)}%
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600">
                                  <div>Position: ({Math.round(detection.bbox.x)}, {Math.round(detection.bbox.y)})</div>
                                  <div>Size: {Math.round(detection.bbox.width)} × {Math.round(detection.bbox.height)}</div>
                                  {detection.text && (
                                    <div className="mt-2 p-2 bg-white rounded border">
                                      <strong>Text:</strong> {detection.text}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Upload className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      Upload an image to get started
                    </h3>
                    <p className="text-gray-500">
                      Select an image file to run AI detection or OCR analysis
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
