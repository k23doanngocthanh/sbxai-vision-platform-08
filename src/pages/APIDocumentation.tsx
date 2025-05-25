import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Copy, FileText, Server, Code, Zap, Globe, Lock, Check } from 'lucide-react';

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
  const [copiedText, setCopiedText] = useState<string | null>(null);

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
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getMethodColor = (method: string) => {
    const colors = {
      get: 'from-blue-500 to-blue-600 shadow-blue-200',
      post: 'from-emerald-500 to-emerald-600 shadow-emerald-200',
      put: 'from-amber-500 to-amber-600 shadow-amber-200',
      delete: 'from-red-500 to-red-600 shadow-red-200',
      patch: 'from-purple-500 to-purple-600 shadow-purple-200',
      options: 'from-slate-500 to-slate-600 shadow-slate-200',
      head: 'from-gray-500 to-gray-600 shadow-gray-200'
    };
    return colors[method.toLowerCase() as keyof typeof colors] || 'from-gray-500 to-gray-600 shadow-gray-200';
  };

  const renderMarkdownContent = (content: string) => {
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-4 text-gray-800">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mb-3 text-gray-700">$1</h3>')
      .replace(/^\d+\. \*\*(.*?)\*\*: (.*$)/gim, '<div class="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-400"><span class="font-semibold text-blue-700">$1</span>: <span class="text-gray-700">$2</span></div>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-gray-800">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic text-gray-600">$1</em>')
      .replace(/^> ⚠️ (.*$)/gim, '<div class="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 my-4"><p class="text-yellow-800 flex items-center"><span class="mr-2">⚠️</span>$1</p></div>')
      .replace(/^---$/gim, '<hr class="my-8 border-gradient">')
      .replace(/\n/g, '<br>');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto p-8">
          <div className="max-w-4xl mx-auto">
            <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-2xl">
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin opacity-20"></div>
                      <div className="absolute inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-800">Loading API Documentation</h3>
                    <p className="text-gray-600">Fetching the latest API specifications...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50">
        <div className="container mx-auto p-8">
          <div className="max-w-4xl mx-auto">
            <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-2xl">
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl">!</span>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">Oops! Something went wrong</h3>
                    <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">{error}</p>
                    <Button 
                      onClick={fetchOpenAPISpec} 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
        <div className="container mx-auto p-8">
          <div className="max-w-4xl mx-auto">
            <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-2xl">
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                  <FileText className="w-16 h-16 mx-auto text-gray-400" />
                  <p className="text-xl text-gray-600">No API specification found</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12 space-y-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Header */}
          <div className="text-center mb-16">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-10 blur-3xl"></div>
              <Card className="relative backdrop-blur-sm bg-white/80 border-0 shadow-2xl rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50"></div>
                <CardHeader className="relative p-12 text-center">
                  <div className="space-y-6">
                    <div 
                      className="prose prose-xl max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: renderMarkdownContent(spec.info.title + '\n\n' + spec.info.description) 
                      }}
                    />
                    <div className="flex items-center justify-center space-x-6 mt-8">
                      <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-700">v{spec.info.version}</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-lg">
                        <Code className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold text-gray-700">OpenAPI {spec.openapi}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="servers" className="space-y-8">
            <div className="flex justify-center">
              <TabsList className="bg-white/70 backdrop-blur-sm border-0 shadow-xl rounded-2xl p-2">
                <TabsTrigger 
                  value="servers" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl px-6 py-3 font-medium transition-all duration-300"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Servers
                </TabsTrigger>
                <TabsTrigger 
                  value="endpoints" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white rounded-xl px-6 py-3 font-medium transition-all duration-300"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Endpoints
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="servers" className="space-y-6">
              {spec.servers && spec.servers.length > 0 && (
                <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center text-2xl font-bold">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mr-4 shadow-lg">
                        <Server className="w-6 h-6 text-white" />
                      </div>
                      Available Servers
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-600">
                      {spec.servers.length} production-ready server{spec.servers.length > 1 ? 's' : ''} at your disposal
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative space-y-4 p-8">
                    {spec.servers.map((server, index) => (
                      <div key={index} className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl"></div>
                        <div className="relative flex items-center justify-between p-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg">
                                <Globe className="w-4 h-4 text-white" />
                              </div>
                              <code className="text-lg font-mono bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-2 rounded-xl text-blue-700 border border-gray-200 shadow-sm">
                                {server.url}
                              </code>
                            </div>
                            {server.description && (
                              <p className="text-gray-600 ml-11 font-medium">{server.description}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="lg"
                            onClick={() => copyToClipboard(server.url)}
                            className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-50 rounded-xl"
                          >
                            {copiedText === server.url ? (
                              <Check className="w-5 h-5 text-green-500" />
                            ) : (
                              <Copy className="w-5 h-5 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="endpoints" className="space-y-6">
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-teal-50/30"></div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center text-2xl font-bold">
                    <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl mr-4 shadow-lg">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    API Endpoints
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    {Object.keys(spec.paths).length} powerful endpoints ready to accelerate your development
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-6 p-8">
                  {Object.entries(spec.paths).map(([path, pathItem]) => (
                    <div key={path} className="space-y-3">
                      {Object.entries(pathItem as Record<string, PathItem>).map(([method, operation]) => {
                        if (typeof operation !== 'object' || !operation) return null;
                        
                        const pathKey = `${method}-${path}`;
                        const isExpanded = expandedPaths.has(pathKey);
                        const gradientClass = getMethodColor(method);
                        
                        return (
                          <div key={pathKey} className="group relative">
                            <div className={`absolute inset-0 bg-gradient-to-r ${gradientClass} rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300 blur-xl`}></div>
                            <Collapsible className="relative">
                              <CollapsibleTrigger
                                className="w-full text-left"
                                onClick={() => togglePath(pathKey)}
                              >
                                <div className="flex items-center justify-between p-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.01]">
                                  <div className="flex items-center space-x-4 flex-1">
                                    <Badge className={`bg-gradient-to-r ${gradientClass} text-white font-mono px-4 py-2 text-sm font-bold shadow-lg transition-all duration-300 hover:shadow-xl`}>
                                      {method.toUpperCase()}
                                    </Badge>
                                    <div className="flex-1 min-w-0">
                                      <code className="font-mono text-base bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-2 rounded-lg text-gray-700 border border-gray-200 block truncate">{path}</code>
                                      {operation.summary && (
                                        <p className="text-gray-600 mt-2 font-medium hidden md:block">{operation.summary}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="transition-transform duration-300 ml-4">
                                    {isExpanded ? (
                                      <ChevronDown className="w-5 h-5 text-gray-400" />
                                    ) : (
                                      <ChevronRight className="w-5 h-5 text-gray-400" />
                                    )}
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                              
                              <CollapsibleContent className="mt-3">
                                <div className="bg-gradient-to-br from-gray-50 to-white backdrop-blur-sm rounded-2xl border border-gray-100 shadow-inner overflow-hidden">
                                  <div className="p-8 space-y-8">
                                    {operation.description && (
                                      <div className="space-y-3">
                                        <h4 className="text-lg font-bold text-gray-800 flex items-center">
                                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
                                          Description
                                        </h4>
                                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                          <p className="text-gray-700 leading-relaxed">{operation.description}</p>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {operation.parameters && operation.parameters.length > 0 && (
                                      <div className="space-y-4">
                                        <h4 className="text-lg font-bold text-gray-800 flex items-center">
                                          <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mr-3"></div>
                                          Parameters
                                        </h4>
                                        <div className="grid gap-4">
                                          {operation.parameters.map((param: any, index: number) => (
                                            <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                                              <div className="flex items-center flex-wrap gap-3 mb-3">
                                                <code className="text-base font-mono bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-200 font-semibold">{param.name}</code>
                                                <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-600 font-medium">
                                                  {param.in}
                                                </Badge>
                                                {param.required && (
                                                  <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold">Required</Badge>
                                                )}
                                              </div>
                                              {param.description && (
                                                <p className="text-gray-600 mb-3 leading-relaxed">{param.description}</p>
                                              )}
                                              {param.schema?.type && (
                                                <div className="flex items-center space-x-2">
                                                  <span className="text-sm text-gray-500 font-medium">Type:</span>
                                                  <code className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">{param.schema.type}</code>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {operation.requestBody && (
                                      <div className="space-y-4">
                                        <h4 className="text-lg font-bold text-gray-800 flex items-center">
                                          <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mr-3"></div>
                                          Request Body
                                        </h4>
                                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                          {operation.requestBody.description && (
                                            <p className="text-gray-700 mb-4 leading-relaxed">{operation.requestBody.description}</p>
                                          )}
                                          {operation.requestBody.content && (
                                            <div className="flex flex-wrap gap-2">
                                              {Object.keys(operation.requestBody.content).map((contentType) => (
                                                <Badge key={contentType} variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 font-medium">{contentType}</Badge>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {operation.responses && (
                                      <div className="space-y-4">
                                        <h4 className="text-lg font-bold text-gray-800 flex items-center">
                                          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
                                          Responses
                                        </h4>
                                        <div className="grid gap-3">
                                          {Object.entries(operation.responses).map(([statusCode, response]: [string, any]) => (
                                            <div key={statusCode} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                                              <div className="flex items-center space-x-3">
                                                <Badge 
                                                  className={statusCode.startsWith('2') 
                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-base px-4 py-2' 
                                                    : 'bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-base px-4 py-2'
                                                  }
                                                >
                                                  {statusCode}
                                                </Badge>
                                                {response.description && (
                                                  <span className="text-gray-600 font-medium">{response.description}</span>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default APIDocumentation;