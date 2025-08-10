import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  DollarSign, 
  Users, 
  CheckCircle, 
  Settings,
  TrendingUp,
  RefreshCw,
  LogOut
} from "lucide-react";
import { checkAdminAuth, logoutAdmin } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UserManagement } from "@/components/user-management";

export default function Admin() {
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [rateOverride, setRateOverride] = useState("");
  const { toast } = useToast();

  // Check authentication status
  useQuery({
    queryKey: ["/api/admin/status"],
    queryFn: async () => {
      const result = await checkAdminAuth();
      setIsAuthenticated(result.isAuthenticated);
      if (!result.isAuthenticated) {
        setLocation("/");
      }
      return result;
    },
  });

  const { data: currentRate } = useQuery({
    queryKey: ["/api/rates/current"],
    enabled: isAuthenticated === true,
  });

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
    enabled: isAuthenticated === true,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated === true,
  });

  const updateRateMutation = useMutation({
    mutationFn: async (newRate: string) => {
      const response = await apiRequest("POST", "/api/admin/rates/update", {
        btcCadRate: newRate,
        change24h: currentRate?.change24h || "0",
        high24h: currentRate?.high24h || newRate,
        low24h: currentRate?.low24h || newRate,
        volume24h: currentRate?.volume24h || "0",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rates/current"] });
      toast({
        title: "Rate updated successfully",
        description: "The exchange rate has been manually updated.",
      });
      setRateOverride("");
    },
    onError: () => {
      toast({
        title: "Failed to update rate",
        description: "There was an error updating the exchange rate.",
        variant: "destructive",
      });
    },
  });

  const resetRateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/rates/reset");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rates/current"] });
      toast({
        title: "Rate reset successfully",
        description: "The exchange rate has been reset to API rate.",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      const response = await apiRequest("POST", "/api/admin/settings", newSettings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings updated successfully",
        description: "System settings have been saved.",
      });
    },
  });

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      setLocation("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleUpdateRate = () => {
    if (rateOverride && !isNaN(Number(rateOverride))) {
      updateRateMutation.mutate(rateOverride);
    }
  };

  const handleResetRate = () => {
    resetRateMutation.mutate();
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newSettings = {
      processingFeePercent: formData.get("processingFee") as string,
      minTransactionCad: formData.get("minTransaction") as string,
      maxTransactionCad: formData.get("maxTransaction") as string,
      rateUpdateIntervalSeconds: formData.get("updateInterval") as string,
      autoRateUpdatesEnabled: formData.get("autoUpdates") === "on",
      maintenanceMode: formData.get("maintenance") === "on",
    };
    updateSettingsMutation.mutate(newSettings);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null; // Will redirect to home
  }

  return (
    <div className="min-h-screen bg-surface-light">
      {/* Admin Header */}
      <header className="bg-secondary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">Welcome, Admin</span>
              <Button 
                onClick={handleLogout}
                className="bg-red-600 text-white hover:bg-red-700 text-sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r overflow-y-auto">
          <nav className="p-6">
            <ul className="space-y-2">
              <li>
                <a href="#dashboard" className="flex items-center px-4 py-2 text-primary bg-blue-50 rounded-lg font-medium">
                  <BarChart3 className="w-5 h-5 mr-3" />
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#rates" className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <DollarSign className="w-5 h-5 mr-3" />
                  Exchange Rates
                </a>
              </li>
              <li>
                <a href="#settings" className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <Settings className="w-5 h-5 mr-3" />
                  Settings
                </a>
              </li>
              <li>
                <a href="#analytics" className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 mr-3" />
                  Analytics
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Dashboard Overview */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
            <p className="text-gray-600">Monitor exchange performance and manage system settings</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="rates">Exchange Rates</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Exchanges</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalExchanges || "0"}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-success">
                <span>↑ 12.5%</span>
                <span className="ml-2 text-gray-600">from last month</span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Volume (24h)</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${stats?.volume24h ? Number(stats.volume24h).toLocaleString() : "0"}
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <DollarSign className="w-6 h-6 text-success" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-success">
                <span>↑ 8.2%</span>
                <span className="ml-2 text-gray-600">from yesterday</span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.activeUsers || "0"}</p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-success">
                <span>↑ 5.4%</span>
                <span className="ml-2 text-gray-600">from last week</span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">System Status</p>
                  <p className="text-3xl font-bold text-success">{stats?.systemStatus || "Online"}</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <span>{stats?.uptime || "99.9%"} uptime</span>
              </div>
              </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="rates" className="space-y-6">
              {/* Exchange Rate Management */}
              <Card className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Manual Rate Override</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Current BTC/CAD Rate</Label>
                <Input
                  type="text"
                  value={currentRate?.btcCadRate || ""}
                  readOnly
                  className="text-lg font-semibold bg-gray-50"
                />
                {currentRate?.isManualOverride && (
                  <p className="text-sm text-warning mt-1">⚠️ Manual override active</p>
                )}
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Override Rate</Label>
                <Input
                  type="text"
                  value={rateOverride}
                  onChange={(e) => setRateOverride(e.target.value)}
                  placeholder="Enter new rate"
                />
              </div>
            </div>
            <div className="mt-6 flex space-x-4">
              <Button
                onClick={handleUpdateRate}
                disabled={updateRateMutation.isPending || !rateOverride}
                className="bg-primary text-white hover:bg-blue-700"
              >
                {updateRateMutation.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                Update Rate
              </Button>
              <Button
                onClick={handleResetRate}
                variant="outline"
                disabled={resetRateMutation.isPending}
              >
                {resetRateMutation.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                Reset to API Rate
              </Button>
              </div>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              {/* System Settings */}
              <Card className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h3>
            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="processingFee">Processing Fee (%)</Label>
                  <Input
                    id="processingFee"
                    name="processingFee"
                    type="text"
                    defaultValue={settings?.processingFeePercent || "0.5"}
                  />
                </div>
                <div>
                  <Label htmlFor="minTransaction">Minimum Transaction (CAD)</Label>
                  <Input
                    id="minTransaction"
                    name="minTransaction"
                    type="text"
                    defaultValue={settings?.minTransactionCad || "10.00"}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="maxTransaction">Maximum Transaction (CAD)</Label>
                  <Input
                    id="maxTransaction"
                    name="maxTransaction"
                    type="text"
                    defaultValue={settings?.maxTransactionCad || "50000.00"}
                  />
                </div>
                <div>
                  <Label htmlFor="updateInterval">Rate Update Interval (seconds)</Label>
                  <Input
                    id="updateInterval"
                    name="updateInterval"
                    type="text"
                    defaultValue={settings?.rateUpdateIntervalSeconds || "30"}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoUpdates"
                    name="autoUpdates"
                    defaultChecked={settings?.autoRateUpdatesEnabled !== false}
                  />
                  <Label htmlFor="autoUpdates" className="text-sm">Enable automatic rate updates</Label>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="maintenance"
                    name="maintenance"
                    defaultChecked={settings?.maintenanceMode === true}
                  />
                  <Label htmlFor="maintenance" className="text-sm">Maintenance mode</Label>
                </div>
              </div>

              <Separator />

              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={updateSettingsMutation.isPending}
                  className="bg-primary text-white hover:bg-blue-700 font-semibold px-8 py-3"
                >
                  {updateSettingsMutation.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                  Save Settings
                </Button>
                </div>
              </form>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
