import SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';

export class WebSocketService {
  private stompClient: any = null;
  private connected = false;

  connect(onMessageReceived: (topic: string, data: any) => void): void {
    const socket = new SockJS('/ws');
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, () => {
      this.connected = true;
      console.log('Connected to WebSocket');

      const subscribe = (topic: string) => {
        this.stompClient.subscribe(topic, (message: any) => {
          try {
            const data = JSON.parse(message.body);
            onMessageReceived(topic, data);
          } catch (e) {
            onMessageReceived(topic, message.body);
          }
        });
      };

      subscribe('/topic/albums');
      subscribe('/topic/albums/delete');
      subscribe('/topic/artists');
      subscribe('/topic/artists/delete');
    }, (error: any) => {
      console.error('WebSocket connection error:', error);
      this.connected = false;
      // Retry connection after 5 seconds
      setTimeout(() => this.connect(onMessageReceived), 5000);
    });
  }

  disconnect(): void {
    if (this.stompClient && this.connected) {
      this.stompClient.disconnect();
      this.connected = false;
      console.log('Disconnected from WebSocket');
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const webSocketService = new WebSocketService();
