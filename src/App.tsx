
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import WorkflowDetail from '@/pages/WorkflowDetail';
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import UploadImages from "./pages/UploadImages";
import ManageLabels from "./pages/ManageLabels";
import Gallery from "./pages/Gallery";
import AnnotationTool from "./pages/AnnotationTool";
import AIPrediction from "./pages/AIPrediction";
import Models from "./pages/Models";
import Workflows from "./pages/Workflows";
import WorkflowCreate from "./pages/WorkflowCreate";
import Jobs from "./pages/Jobs";
import Settings from "./pages/Settings";
import APIDocumentation from "./pages/APIDocumentation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-white">
            <Header />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/projects/:id/upload" element={<UploadImages />} />
              <Route path="/projects/:id/labels" element={<ManageLabels />} />
              <Route path="/projects/:id/gallery" element={<Gallery />} />
              <Route path="/projects/:id/annotate" element={<AnnotationTool />} />
              <Route path="/ai-prediction" element={<AIPrediction />} />
              <Route path="/models" element={<Models />} />
              <Route path="/workflows" element={<Workflows />} />
              <Route path="/workflows/:id" element={<WorkflowDetail />} />
              <Route path="/workflows/create" element={<WorkflowCreate />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/api-docs" element={<APIDocumentation />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
