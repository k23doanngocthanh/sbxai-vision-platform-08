
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    description: string;
    version: string;
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  paths: Record<string, any>;
  components?: {
    schemas?: Record<string, any>;
    securitySchemes?: Record<string, any>;
  };
}

interface PathItem {
  summary?: string;
  description?: string;
  parameters?: Array<any>;
  responses?: Record<string, any>;
  requestBody?: any;
  security?: Array<any>;
}

const APIDocumentation = () => {
  const [spec, setSpec] = useState<OpenAPISpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchOpenAPISpec();
  }, []);

  const fetchOpenAPISpec = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://sbxai.devhub.io.vn/openapi.json');
      
      if (!response.ok) {
        throw new Error('Failed to fetch OpenAPI specification');
      }
      
      const data = await response.json();
      setSpec(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const togglePath = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  const getMethodColor = (method: string) => {
    const colors = {
      get: 'bg-blue-500',
      post: 'bg-green-500',
      put: 'bg-yellow-500',
      delete: 'bg-red-500',
      patch: 'bg-purple-500',
      options: 'bg-gray-500',
      head: 'bg-gray-400'
    };
    return colors[method.toLowerCase() as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading API Documentation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-4">Error loading API documentation: {error}</p>
              <Button onClick={fetchOpenAPISpec}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p>No API specification found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl">{spec.info.title}</CardTitle>
              <CardDescription className="text-lg mt-2">
                {spec.info.description}
              </CardDescription>
              <Badge variant="outline" className="mt-2">
                Version {spec.info.version} • OpenAPI {spec.openapi}
              </Badge>
            </div>
            <Button variant="outline" asChild>
              <a href="https://sbxai.devhub.io.vn/openapi.json" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Raw JSON
              </a>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Servers */}
      {spec.servers && spec.servers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Servers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {spec.servers.map((server, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <code className="text-sm font-mono">{server.url}</code>
                  {server.description && (
                    <p className="text-sm text-gray-600 mt-1">{server.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(server.url)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>
            {Object.keys(spec.paths).length} endpoints available
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(spec.paths).map(([path, pathItem]) => (
            <div key={path} className="border rounded-lg">
              {Object.entries(pathItem as Record<string, PathItem>).map(([method, operation]) => {
                if (typeof operation !== 'object' || !operation) return null;
                
                const pathKey = `${method}-${path}`;
                const isExpanded = expandedPaths.has(pathKey);
                
                return (
                  <Collapsible key={pathKey}>
                    <CollapsibleTrigger
                      className="w-full p-4 hover:bg-gray-50 transition-colors"
                      onClick={() => togglePath(pathKey)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge className={`${getMethodColor(method)} text-white font-mono`}>
                            {method.toUpperCase()}
                          </Badge>
                          <code className="font-mono text-sm">{path}</code>
                          {operation.summary && (
                            <span className="text-gray-600">{operation.summary}</span>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="border-t bg-gray-50">
                      <div className="p-4 space-y-4">
                        {operation.description && (
                          <div>
                            <h4 className="font-semibold mb-2">Description</h4>
                            <p className="text-gray-700">{operation.description}</p>
                          </div>
                        )}
                        
                        {operation.parameters && operation.parameters.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Parameters</h4>
                            <div className="space-y-2">
                              {operation.parameters.map((param: any, index: number) => (
                                <div key={index} className="bg-white p-3 rounded border">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <code className="text-sm font-mono">{param.name}</code>
                                    <Badge variant={param.required ? "default" : "secondary"}>
                                      {param.in}
                                    </Badge>
                                    {param.required && (
                                      <Badge variant="destructive" className="text-xs">Required</Badge>
                                    )}
                                  </div>
                                  {param.description && (
                                    <p className="text-sm text-gray-600">{param.description}</p>
                                  )}
                                  {param.schema?.type && (
                                    <p className="text-xs text-gray-500 mt-1">Type: {param.schema.type}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {operation.requestBody && (
                          <div>
                            <h4 className="font-semibold mb-2">Request Body</h4>
                            <div className="bg-white p-3 rounded border">
                              {operation.requestBody.description && (
                                <p className="text-gray-700 mb-2">{operation.requestBody.description}</p>
                              )}
                              {operation.requestBody.content && (
                                <div className="space-y-2">
                                  {Object.keys(operation.requestBody.content).map((contentType) => (
                                    <Badge key={contentType} variant="outline">{contentType}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {operation.responses && (
                          <div>
                            <h4 className="font-semibold mb-2">Responses</h4>
                            <div className="space-y-2">
                              {Object.entries(operation.responses).map(([statusCode, response]: [string, any]) => (
                                <div key={statusCode} className="bg-white p-3 rounded border">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Badge variant={statusCode.startsWith('2') ? 'default' : 'destructive'}>
                                      {statusCode}
                                    </Badge>
                                    {response.description && (
                                      <span className="text-sm text-gray-600">{response.description}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default APIDocumentation;
