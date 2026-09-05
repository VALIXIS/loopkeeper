import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type RoutePath =
  | 'dashboard'
  | 'meetings'
  | 'meeting-detail'
  | 'commitments'
  | 'commitment-detail'
  | 'accountability'
  | 'insights'
  | 'workload'
  | 'integrations'
  | 'recording'
  | 'settings';

export interface RouteState {
  path: RoutePath;
  params: Record<string, string>;
  query: Record<string, string>;
}

interface RouterContextType {
  route: RouteState;
  navigate: (to: string, state?: Record<string, any>) => void;
  navigateToMeeting: (id: string) => void;
  navigateToCommitment: (id: string) => void;
  navigateToAccountability: (tab?: string) => void;
  goBack: () => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

function parseCurrentLocation(): RouteState {
  // Support both pathname routing and hash routing fallback
  const hash = window.location.hash.replace(/^#/, '');
  const pathString = hash ? hash : window.location.pathname;
  const searchString = window.location.search;

  // Query params
  const urlParams = new URLSearchParams(searchString || (hash.includes('?') ? hash.split('?')[1] : ''));
  const query: Record<string, string> = {};
  urlParams.forEach((val, key) => {
    query[key] = val;
  });

  const cleanPath = (pathString.split('?')[0] || '/').replace(/^\/+|\/+$/g, '');
  const segments = cleanPath ? cleanPath.split('/') : [];

  if (segments.length === 0 || segments[0] === '' || segments[0] === 'dashboard') {
    return { path: 'dashboard', params: {}, query };
  }

  if (segments[0] === 'meetings') {
    if (segments[1]) {
      return { path: 'meeting-detail', params: { meetingId: segments[1] }, query };
    }
    return { path: 'meetings', params: {}, query };
  }

  if (segments[0] === 'commitments' || segments[0] === 'tasks') {
    if (segments[1]) {
      return { path: 'commitment-detail', params: { commitmentId: segments[1] }, query };
    }
    return { path: 'commitments', params: {}, query };
  }

  if (segments[0] === 'accountability' || segments[0] === 'radar' || segments[0] === 'graph') {
    return { path: 'accountability', params: {}, query };
  }

  if (segments[0] === 'insights') {
    return { path: 'insights', params: {}, query };
  }

  if (segments[0] === 'workload') {
    return { path: 'workload', params: {}, query };
  }

  if (segments[0] === 'integrations') {
    return { path: 'integrations', params: {}, query };
  }

  if (segments[0] === 'recording') {
    return { path: 'recording', params: {}, query };
  }

  if (segments[0] === 'settings') {
    return { path: 'settings', params: {}, query };
  }

  return { path: 'dashboard', params: {}, query };
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<RouteState>(() => parseCurrentLocation());

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseCurrentLocation());
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = useCallback((to: string, _state?: Record<string, any>) => {
    let normalizedUrl = to.startsWith('/') ? to : `/${to}`;
    
    // Use history pushState
    try {
      window.history.pushState({}, '', normalizedUrl);
    } catch {
      window.location.hash = normalizedUrl;
    }

    setRoute(parseCurrentLocation());
  }, []);

  const navigateToMeeting = useCallback((id: string) => {
    navigate(`/meetings/${id}`);
  }, [navigate]);

  const navigateToCommitment = useCallback((id: string) => {
    navigate(`/commitments/${id}`);
  }, [navigate]);

  const navigateToAccountability = useCallback((tab?: string) => {
    const url = tab ? `/accountability?tab=${tab}` : '/accountability';
    navigate(url);
  }, [navigate]);

  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  return (
    <RouterContext.Provider
      value={{
        route,
        navigate,
        navigateToMeeting,
        navigateToCommitment,
        navigateToAccountability,
        goBack
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
