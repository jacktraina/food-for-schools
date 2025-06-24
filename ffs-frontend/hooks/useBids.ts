import { useApiQuery, usePatchMutation, usePostMutation, useDeleteMutation } from './use-api';
import { Bid, PaginatedBidsParams, PaginatedBidsResponse, getPaginatedBids } from '@/lib/api/bids';
import { LoginResponseUser } from '@/types/auth';
import { useEffect, useState, useMemo } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';

export function useBids() {
  const [userData, setUserData] = useState<LoginResponseUser | null>(null);
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [queryKey, setQueryKey] = useState<string[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as LoginResponseUser;
        setUserData(parsedUser);
        
        if (parsedUser.districtId) {
          setEndpoint(`/bids/district/${parsedUser.districtId}`);
          setQueryKey(['bids', 'district', parsedUser.districtId.toString()]);
        } else if (parsedUser.cooperativeId) {
          setEndpoint(`/bids/cooperative/${parsedUser.cooperativeId}`);
          setQueryKey(['bids', 'cooperative', parsedUser.cooperativeId.toString()]);
        } else {
          setEndpoint('/bids');
          setQueryKey(['bids']);
        }
      } catch (e) {
        console.error('Failed to parse user data:', e);
        setEndpoint('/bids');
        setQueryKey(['bids']);
      }
    } else {
      setEndpoint('/bids');
      setQueryKey(['bids']);
    }
  }, []);

  const queryResult = useApiQuery<Bid[]>(
    endpoint || '/bids',
    queryKey.length > 0 ? queryKey : ['bids'],
    {
      enabled: !!endpoint,
    }
  );

  return {
    ...queryResult,
    userData,
  };
}

export function usePaginatedBids(params: PaginatedBidsParams = {}) {
  const [userData, setUserData] = useState<LoginResponseUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as LoginResponseUser;
        setUserData(parsedUser);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  }, []);

  const enhancedParams = useMemo(() => {
    const newParams = { ...params };
    
    if (userData?.districtId && !newParams.cooperativeId) {
      newParams.districtId = userData.districtId;
    } else if (userData?.cooperativeId && !newParams.districtId) {
      newParams.cooperativeId = userData.cooperativeId;
    }
    
    return newParams;
  }, [params, userData]);

  return useQuery<PaginatedBidsResponse>({
    queryKey: ['bids', 'paginated', enhancedParams],
    queryFn: () => getPaginatedBids(enhancedParams),
    enabled: true,
  });
}

export function useBidMutations() {
  const queryClient = useQueryClient();

  const updateBidMutation = usePatchMutation<Partial<Bid>, Bid>('/bids', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bids'] });
      queryClient.invalidateQueries({ queryKey: ['bids', 'paginated'] });
    },
  });

  const createBidMutation = usePostMutation<Omit<Bid, 'id'>, Bid>('/bids', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bids'] });
      queryClient.invalidateQueries({ queryKey: ['bids', 'paginated'] });
    },
  });

  const deleteBidMutation = useDeleteMutation<void>('/bids', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bids'] });
      queryClient.invalidateQueries({ queryKey: ['bids', 'paginated'] });
    },
  });

  return {
    updateBid: updateBidMutation,
    createBid: createBidMutation,
    deleteBid: deleteBidMutation,
  };
}
