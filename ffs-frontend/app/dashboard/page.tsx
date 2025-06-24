'use client';

import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
// Remove or comment out: import { NewsFeed } from "@/components/dashboard/news-feed"
import { USDAFeedClient } from '@/components/dashboard/usda-feed-client';
import { QuickLinks } from '@/components/dashboard/quick-links';
import { Button } from '@/components/ui/button';
import { PlusCircle, TrendingUp, Users } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { User } from '@/types/user';
import { Modal } from '@/components/Modal';
import { AddTaskForm } from '@/components/dashboard/AddTaskForm';
import { Task } from '@/types/task';
import {
  useApiQuery,
  usePatchMutation,
  usePostMutation,
} from '@/hooks/use-api';
import { toast } from 'sonner';
import { LoginResponseUser, Meta } from '@/types/auth';
import { AxiosError } from 'axios';
import { DashboardMetrics } from '@/lib/api/dashboard';
import { CreateBidModal } from '@/components/dashboard/create-bid-modal';
import { Bid } from '@/lib/api/bids';
import { useToast } from '@/components/ui/toast-context';

export default function DashboardPage() {
  const [userData, setUserData] = useState<LoginResponseUser | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [userName, setUserName] = useState('User');
  const [open, setOpen] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const { toast } = useToast();

  const {
    data: tasks,
    isLoading,
    refetch,
  } = useApiQuery<Task[]>('/tasks', ['tasks']);

  const {
    data: dashboardMetrics,
    isLoading: isDashboardLoading,
    refetch: refetchMetrics,
  } = useApiQuery<DashboardMetrics>('/dashboard', ['dashboard']);

  const { mutate: updateTask } = usePatchMutation<Partial<Task>, Task>(
    '/tasks',
    {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: `You have updated the task successfully!`,
          variant: 'success',
        });
        refetch();
      },
      onError: (error: AxiosError<Meta>) => {
        toast({
          title: 'Error',
          description:
            error?.response?.data?.error || 'Failed to update the task',
          variant: 'destructive',
        });
      },
    }
  );

  const { mutate: createBidMutation, isPending: isCreatingBid } =
    usePostMutation<any, Bid>('/bids', {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: `You have created the bid successfully!`,
          variant: 'success',
        });
        setCreateModalOpen(false);
        refetchMetrics();
      },
      onError: (error: AxiosError<Meta>) => {
        toast({
          title: 'Error',
          description: error?.response?.data?.error || 'Failed to create bid',
          variant: 'destructive',
        });
      },
    });

  // Load user data from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as LoginResponseUser;
        setUserData(parsedUser);
        setUserName(parsedUser.firstName || 'User'); // Use firstName instead of splitting name
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  }, []);

  const handleCreateBid = (newBid: any) => {
    createBidMutation(newBid);
  };

  const handleStatusChange = async (
    taskId: string,
    checked: boolean | 'indeterminate'
  ) => {
    const isCompleted = checked === true;

    updateTask({ id: taskId, data: { is_completed: isCompleted } });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {userName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your{' '}
            {userData?.roles?.some((role) => role.scope.type === 'coop')
              ? 'cooperative'
              : 'district'}{' '}
            procurement activities today.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="card-with-colored-border border-l-blue-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bids</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isDashboardLoading
                  ? '...'
                  : dashboardMetrics?.active_bids || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {isDashboardLoading
                  ? '...'
                  : dashboardMetrics?.active_bids_change || 'No change'}
              </p>
            </CardContent>
          </Card>
          <Card className="card-with-colored-border border-l-green-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Approvals
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-green-500"
              >
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                <path d="M12 11h4" />
                <path d="M12 16h4" />
                <path d="M8 11h.01" />
                <path d="M8 16h.01" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isDashboardLoading
                  ? '...'
                  : dashboardMetrics?.pending_approvals || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {isDashboardLoading
                  ? '...'
                  : dashboardMetrics?.pending_approvals_change || 'No change'}
              </p>
            </CardContent>
          </Card>
          <Card className="card-with-colored-border border-l-purple-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {userData?.cooperativeId
                  ? 'Member Districts'
                  : 'Active Vendors'}
              </CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isDashboardLoading
                  ? '...'
                  : userData?.cooperativeId
                  ? dashboardMetrics?.member_districts || 0
                  : dashboardMetrics?.active_vendors || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {isDashboardLoading
                  ? '...'
                  : dashboardMetrics?.vendors_or_districts_change ||
                    'No change'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="card-gradient-header">
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col items-start">
                <CardTitle>Todo List</CardTitle>
                <CardDescription>
                  Tasks that need your attention
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-white hover:bg-blue-50 ml-auto"
                onClick={() => setOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4 text-blue-500" />
                Add Task
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-0">
            {tasks && tasks.length > 0 ? (
              (showAllTasks ? tasks : tasks.slice(0, 5)).map((task) => (
                <div key={task.id} className="space-y-4">
                  <div className="pt-4 flex items-start space-x-4">
                    <Checkbox
                      id={task.id}
                      className="mt-1"
                      checked={task.is_completed}
                      onCheckedChange={(checked) =>
                        handleStatusChange(task.id, checked)
                      }
                    />
                    <div className="space-y-1 leading-none">
                      <Label
                        htmlFor={task.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {task.title}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Due by {task.due_date}
                      </p>
                    </div>
                  </div>
                  <Separator />
                </div>
              ))
            ) : (
              <div className="py-4 text-left text-md text-muted-foreground">
                No tasks found.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          {tasks && tasks.length > 5 && (
            <Button
              variant="default"
              onClick={() => setShowAllTasks((prev) => !prev)}
            >
              {showAllTasks ? 'Show Less' : 'View All Tasks'}
            </Button>
          )}
          <Button variant="outline" onClick={() => setCreateModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Bid
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <USDAFeedClient />
        <QuickLinks />
      </div>
      <CreateBidModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreateBid}
        isLoading={isCreatingBid}
      />
      <Modal
        title="Add New Task"
        description="Fill out the task details"
        open={open}
        onOpenChange={setOpen}
      >
        <AddTaskForm
          onSuccess={() => {
            setOpen(false);
            refetch();
          }}
        />
      </Modal>
    </div>
  );
}
