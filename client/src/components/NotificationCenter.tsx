import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, DollarSign, Image, Heart, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type NotificationType = 'bid' | 'sale' | 'mint' | 'like' | 'offer' | 'follow';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  timestamp: Date;
  link?: string;
  thumbnail?: string;
}

// Map notification types to icons
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'bid':
      return <DollarSign className="h-4 w-4 text-yellow-500" />;
    case 'sale':
      return <ShoppingBag className="h-4 w-4 text-green-500" />;
    case 'mint':
      return <Image className="h-4 w-4 text-blue-500" />;
    case 'like':
      return <Heart className="h-4 w-4 text-red-500" />;
    case 'offer':
      return <DollarSign className="h-4 w-4 text-purple-500" />;
    case 'follow':
      return <Check className="h-4 w-4 text-cyan-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Setup WebSocket connection when component mounts
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    // Track reconnection attempts
    let reconnectAttempts = 0;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isReconnecting = false;
    
    const clearReconnectTimeout = () => {
      if (reconnectTimeout !== null) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };
    
    const connectWebSocket = () => {
      // Clear any existing timeout
      clearReconnectTimeout();
      
      // Don't attempt reconnecting if already in process
      if (isReconnecting) return;
      isReconnecting = true;
      
      console.log(`Attempting to connect to WebSocket at: ${wsUrl} (attempt ${reconnectAttempts + 1})`);
      
      try {
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log("WebSocket connected successfully");
          reconnectAttempts = 0; // Reset counter on successful connection
          isReconnecting = false;
          
          // If user is logged in, send authentication
          if (user) {
            try {
              const authMessage = JSON.stringify({ 
                type: 'auth', 
                userId: user.id 
              });
              ws.send(authMessage);
              console.log("Sent authentication to WebSocket server");
            } catch (err) {
              console.error("Failed to send authentication:", err);
            }
          }
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'notification') {
              const newNotification: Notification = {
                id: data.id,
                type: data.notificationType || 'system',
                message: data.message,
                read: false,
                timestamp: new Date(data.timestamp || Date.now()),
                link: data.link,
                thumbnail: data.thumbnail
              };
              
              setNotifications((prev) => [newNotification, ...prev].slice(0, 50)); // Keep last 50 notifications
              setUnreadCount((prev) => prev + 1);
              
              // Show browser notification if supported and permission is granted
              if (typeof window !== 'undefined' && 'Notification' in window && 
                  Notification.permission === "granted" && !document.hasFocus()) {
                new Notification("VeCollab Marketplace", { 
                  body: newNotification.message,
                  icon: "/logo.svg" 
                });
              }
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };
        
        ws.onclose = (event) => {
          // Calculate reconnection delay with exponential backoff, capped at 30 seconds
          const delay = Math.min(5000 * Math.pow(1.5, reconnectAttempts), 30000);
          reconnectAttempts++;
          isReconnecting = false;
          
          console.log(`WebSocket disconnected (code: ${event.code}), reconnecting in ${Math.round(delay/1000)}s...`);
          
          // Schedule reconnection
          reconnectTimeout = setTimeout(connectWebSocket, delay);
        };
        
        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          // Let onclose handle reconnection
          if (ws.readyState === ws.OPEN) {
            ws.close();
          }
        };
        
        wsRef.current = ws;
      } catch (err) {
        console.error("Error creating WebSocket:", err);
        isReconnecting = false;
        
        // Attempt reconnect with backoff
        const delay = Math.min(5000 * Math.pow(1.5, reconnectAttempts), 30000);
        reconnectAttempts++;
        
        console.log(`WebSocket creation failed, retrying in ${Math.round(delay/1000)}s...`);
        reconnectTimeout = setTimeout(connectWebSocket, delay);
      }
    };
    
    connectWebSocket();
    
    // Request notification permission if browser supports it
    if (typeof window !== 'undefined' && 'Notification' in window && 
        Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
    
    // Initialize with empty notifications array
    setNotifications([]);
    setUnreadCount(0);
    
    // Cleanup WebSocket on unmount
    return () => {
      clearReconnectTimeout();
      
      if (wsRef.current) {
        // Use 1000 (normal closure) to cleanly close
        wsRef.current.close(1000, "Component unmounted");
      }
    };
  }, [user]);
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    setUnreadCount(0);
  };
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  const removeNotification = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };
  
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative mr-2"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute top-0 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[9px] bg-primary text-primary-foreground"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        alignOffset={-20}
        className="w-80 max-h-[80vh] overflow-hidden flex flex-col z-50"
        sideOffset={10}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs h-8"
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <div className="overflow-y-auto max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mb-2 opacity-20" />
              <p>No notifications yet</p>
              <p className="text-sm">You'll see activity on your NFTs and collections here</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id}
                className={cn(
                  "flex items-start gap-3 p-3 border-b hover:bg-accent/50 transition-colors cursor-pointer",
                  !notification.read && "bg-accent/30"
                )}
                onClick={() => {
                  markAsRead(notification.id);
                  if (notification.link) {
                    window.location.href = notification.link;
                  }
                }}
              >
                <div className="mt-1 flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm break-words">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTimeAgo(notification.timestamp)}
                  </p>
                </div>
                <button 
                  className="text-muted-foreground hover:text-foreground mt-1 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}