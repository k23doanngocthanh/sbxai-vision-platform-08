
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Copy, FileText, Server, Code } from 'lucide-react';
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
      get: 'bg-blue-500 hover:bg-blue-600',
      post: 'bg-green-500 hover:bg-green-600',
      put: 'bg-yellow-500 hover:bg-yellow-600',
      delete: 'bg-red-500 hover:bg-red-600',
      patch: 'bg-purple-500 hover:bg-purple-600',
      options: 'bg-gray-500 hover:bg-gray-600',
      head: 'bg-gray-400 hover:bg-gray-500'
    };
    return colors[method.toLowerCase() as keyof typeof colors] || 'bg-gray-500 hover:bg-gray-600';
  };

  const renderMarkdownContent = (content: string) => {
    // Simple markdown-like rendering for the description
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 text-gradient">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3 text-gray-800">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium mb-2 text-gray-700">$1</h3>')
      .replace(/^\d+\. \*\*(.*?)\*\*: (.*$)/gim, '<div class="mb-2"><span class="font-semibold text-blue-600">$1</span>: $2</div>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
      .replace(/^> ⚠️ (.*$)/gim, '<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4"><p class="text-yellow-800">⚠️ $1</p></div>')
      .replace(/^---$/gim, '<hr class="my-6 border-gray-200">')
      .replace(/\n/g, '<br>');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="hover-lift">
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading API Documentation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="hover-lift">
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-4">Error loading API documentation: {error}</p>
              <Button onClick={fetchOpenAPISpec} className="gradient-primary text-white">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="container mx-auto p-6">
        <Card className="hover-lift">
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-gray-600">No API specification found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header with Markdown Content */}
      <Card className="gradient-card hover-lift border-0 shadow-xl">
        <CardHeader className="text-center">
          <div className="space-y-4">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: renderMarkdownContent(spec.info.title + '\n\n' + spec.info.description) 
              }}
            />
            <div className="flex items-center justify-center space-x-4 mt-6">
              <Badge variant="outline" className="bg-white/20 border-white/30 text-gray-700 px-4 py-2">
                <FileText className="w-4 h-4 mr-2" />
                Version {spec.info.version}
              </Badge>
              <Badge variant="outline" className="bg-white/20 border-white/30 text-gray-700 px-4 py-2">
                <Code className="w-4 h-4 mr-2" />
                OpenAPI {spec.openapi}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="servers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100">
          <TabsTrigger value="servers" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
            <Server className="w-4 h-4 mr-2" />
            Servers
          </TabsTrigger>
          <TabsTrigger value="endpoints" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
            <Code className="w-4 h-4 mr-2" />
            API Endpoints
          </TabsTrigger>
        </TabsList>

        <TabsContent value="servers" className="space-y-4">
          {spec.servers && spec.servers.length > 0 && (
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="w-5 h-5 mr-2 text-blue-500" />
                  Available Servers
                </CardTitle>
                <CardDescription>
                  {spec.servers.length} server{spec.servers.length > 1 ? 's' : ''} configured
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {spec.servers.map((server, index) => (
                  <div key={index} className="group flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:shadow-md transition-all duration-200">
                    <div className="flex-1">
                      <code className="text-sm font-mono bg-white px-2 py-1 rounded text-blue-600 border">
                        {server.url}
                      </code>
                      {server.description && (
                        <p className="text-sm text-gray-600 mt-2">{server.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(server.url)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="w-5 h-5 mr-2 text-green-500" />
                API Endpoints
              </CardTitle>
              <CardDescription>
                {Object.keys(spec.paths).length} endpoints available
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(spec.paths).map(([path, pathItem]) => (
                <div key={path} className="border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200">
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
                              <Badge className={`${getMethodColor(method)} text-white font-mono transition-colors duration-200`}>
                                {method.toUpperCase()}
                              </Badge>
                              <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{path}</code>
                              {operation.summary && (
                                <span className="text-gray-600 hidden md:inline">{operation.summary}</span>
                              )}
                            </div>
                            <div className="transition-transform duration-200">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent className="border-t bg-gray-50 animate-accordion-down">
                          <div className="p-4 space-y-4">
                            {operation.description && (
                              <div>
                                <h4 className="font-semibold mb-2 text-gray-800">Description</h4>
                                <p className="text-gray-700 bg-white p-3 rounded border">{operation.description}</p>
                              </div>
                            )}
                            
                            {operation.parameters && operation.parameters.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2 text-gray-800">Parameters</h4>
                                <div className="space-y-2">
                                  {operation.parameters.map((param: any, index: number) => (
                                    <div key={index} className="bg-white p-3 rounded border hover:shadow-sm transition-shadow duration-200">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <code className="text-sm font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">{param.name}</code>
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
                                <h4 className="font-semibold mb-2 text-gray-800">Request Body</h4>
                                <div className="bg-white p-3 rounded border hover:shadow-sm transition-shadow duration-200">
                                  {operation.requestBody.description && (
                                    <p className="text-gray-700 mb-2">{operation.requestBody.description}</p>
                                  )}
                                  {operation.requestBody.content && (
                                    <div className="space-y-2">
                                      {Object.keys(operation.requestBody.content).map((contentType) => (
                                        <Badge key={contentType} variant="outline" className="mr-2">{contentType}</Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {operation.responses && (
                              <div>
                                <h4 className="font-semibold mb-2 text-gray-800">Responses</h4>
                                <div className="space-y-2">
                                  {Object.entries(operation.responses).map(([statusCode, response]: [string, any]) => (
                                    <div key={statusCode} className="bg-white p-3 rounded border hover:shadow-sm transition-shadow duration-200">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <Badge 
                                          variant={statusCode.startsWith('2') ? 'default' : 'destructive'}
                                          className={statusCode.startsWith('2') ? 'bg-green-500' : ''}
                                        >
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIDocumentation;
