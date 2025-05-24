
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Key, 
  CreditCard,
  Bell,
  Shield,
  Plus,
  Copy,
  Trash2
} from 'lucide-react';
import { API_CONFIG, STORAGE_KEYS } from '@/lib/constants';

interface ApiKey {
  id: number;
  name: string;
  key_value: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

export default function Settings() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    fetchApiKeys();
  }, [isAuthenticated, navigate]);

  const fetchApiKeys = async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.API_KEYS}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.api_keys || []);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) return;

    setCreating(true);
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const formData = new FormData();
      formData.append('name', newKeyName);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.API_KEYS}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        }
      );

      if (response.ok) {
        await fetchApiKeys();
        setNewKeyName('');
        toast({
          title: "Success",
          description: "API key created successfully!",
        });
      } else {
        throw new Error('Failed to create API key');
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  const deleteApiKey = async (keyId: number, keyName: string) => {
    if (!confirm(`Are you sure you want to delete the API key "${keyName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.API_KEYS}/${keyId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (response.ok) {
        setApiKeys(apiKeys.filter(key => key.id !== keyId));
        toast({
          title: "Success",
          description: `API key "${keyName}" deleted successfully`,
        });
      } else {
        throw new Error('Failed to delete API key');
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account preferences and API access
          </p>
        </div>

        {/* Profile Settings */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-blue-600" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  defaultValue={user?.name || ''}
                  placeholder="Your display name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <Label>Subscription</Label>
                  <div className="mt-1">
                    <Badge className="gradient-primary text-white border-0">
                      {user?.subscription || 'Free'}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button className="gradient-primary text-white">
                Update Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="mr-2 h-5 w-5 text-green-600" />
              API Keys
            </CardTitle>
            <CardDescription>
              Manage your API keys for programmatic access
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Create New API Key */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="API key name (e.g., Frontend App)"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={createApiKey}
                  disabled={!newKeyName.trim() || creating}
                  className="gradient-primary text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {creating ? 'Creating...' : 'Create Key'}
                </Button>
              </div>
            </div>

            {/* API Keys List */}
            <div className="space-y-4">
              {apiKeys.length > 0 ? (
                apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
                        <p className="text-sm text-gray-500">
                          Created {new Date(apiKey.created_at).toLocaleDateString()}
                          {apiKey.last_used_at && (
                            <span> • Last used {new Date(apiKey.last_used_at).toLocaleDateString()}</span>
                          )}
                        </p>
                        <div className="mt-2 font-mono text-sm bg-gray-100 p-2 rounded border">
                          {apiKey.key_value.substring(0, 20)}...
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(apiKey.key_value)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteApiKey(apiKey.id, apiKey.name)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No API keys created yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5 text-yellow-600" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Manage your notification preferences</p>
              <Button variant="outline" className="w-full">
                Configure Notifications
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-red-600" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Update your security settings</p>
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
