import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Wallet, Bitcoin, Edit3, RefreshCw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface BalanceEditModalProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function BalanceEditModal({ user, open, onOpenChange }: BalanceEditModalProps) {
  const [cadBalance, setCadBalance] = useState(user.cadBalance || "0.00");
  const [btcBalance, setBtcBalance] = useState(user.btcBalance || "0.00000000");
  const { toast } = useToast();

  const updateBalanceMutation = useMutation({
    mutationFn: async (data: { userId: string; cadBalance: string; btcBalance: string }) => {
      const response = await apiRequest("POST", "/api/admin/users/balance", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Balance updated",
        description: `Updated balances for ${user.username}`,
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update user balance",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBalanceMutation.mutate({
      userId: user.id,
      cadBalance,
      btcBalance,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Balance - {user.username}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cadBalance">CAD Balance</Label>
            <Input
              id="cadBalance"
              type="text"
              value={cadBalance}
              onChange={(e) => setCadBalance(e.target.value)}
              placeholder="0.00"
            />
          </div>
          
          <div>
            <Label htmlFor="btcBalance">BTC Balance</Label>
            <Input
              id="btcBalance"
              type="text"
              value={btcBalance}
              onChange={(e) => setBtcBalance(e.target.value)}
              placeholder="0.00000000"
            />
          </div>
          
          <div className="flex space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-primary hover:bg-blue-700"
              disabled={updateBalanceMutation.isPending}
            >
              {updateBalanceMutation.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              Update
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  };

  const formatBTC = (amount: string | number) => {
    return Number(amount).toFixed(8);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('en-CA');
  };

  const handleEditBalance = (user: User) => {
    setSelectedUser(user);
    setShowBalanceModal(true);
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-primary mr-3" />
            <h3 className="text-2xl font-bold text-gray-900">User Management</h3>
          </div>
          <Badge variant="outline" className="text-sm">
            {(users && Array.isArray(users) ? users.length : 0)} Users
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>CAD Balance</TableHead>
                <TableHead>BTC Balance</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users && Array.isArray(users) && users.map((user: User) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Wallet className="w-4 h-4 text-green-600 mr-2" />
                      {formatCurrency(user.cadBalance || "0")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Bitcoin className="w-4 h-4 text-orange-600 mr-2" />
                      {formatBTC(user.btcBalance || "0")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isAdmin ? "default" : "secondary"}>
                      {user.isAdmin ? "Admin" : "User"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {user.createdAt ? formatDate(user.createdAt) : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleEditBalance(user)}
                      size="sm"
                      variant="outline"
                      className="flex items-center"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit Balance
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {users && Array.isArray(users) && users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found
          </div>
        )}
      </Card>

      {selectedUser && (
        <BalanceEditModal
          user={selectedUser}
          open={showBalanceModal}
          onOpenChange={setShowBalanceModal}
        />
      )}
    </>
  );
}