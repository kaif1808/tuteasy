import { AuthenticatedSocket } from '../middleware/socketAuth';
import { prisma } from '../utils/prisma';
import { signalingRateLimits, webrtcConfig } from '../config/webrtc.config';

interface PeerConnection {
  socketId: string;
  userId: string;
  sessionId: string;
  peerId?: string;
  state: 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed';
  lastActivity: Date;
  reconnectAttempts: number;
  connectionQuality?: ConnectionQuality;
}

interface ConnectionQuality {
  packetLossRate: number;
  jitter: number;
  roundTripTime: number;
  bandwidth: {
    upload: number;
    download: number;
  };
  timestamp: Date;
}

interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'renegotiate';
  from: string;
  to: string;
  sessionId: string;
  payload: any;
}

interface MediaState {
  userId: string;
  sessionId: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

export class SignalingService {
  private connections: Map<string, PeerConnection> = new Map();
  private sessionPeers: Map<string, Set<string>> = new Map();
  private rateLimiters: Map<string, Map<string, number>> = new Map();

  /**
   * Register a new peer connection
   */
  registerPeer(socket: AuthenticatedSocket, sessionId: string): PeerConnection {
    const connection: PeerConnection = {
      socketId: socket.id,
      userId: socket.user!.id,
      sessionId,
      state: 'new',
      lastActivity: new Date(),
      reconnectAttempts: 0
    };

    this.connections.set(socket.id, connection);
    
    // Add to session peers
    if (!this.sessionPeers.has(sessionId)) {
      this.sessionPeers.set(sessionId, new Set());
    }
    this.sessionPeers.get(sessionId)!.add(socket.id);

    return connection;
  }

  /**
   * Unregister a peer connection
   */
  unregisterPeer(socketId: string): void {
    const connection = this.connections.get(socketId);
    if (connection) {
      // Remove from session peers
      const sessionPeers = this.sessionPeers.get(connection.sessionId);
      if (sessionPeers) {
        sessionPeers.delete(socketId);
        if (sessionPeers.size === 0) {
          this.sessionPeers.delete(connection.sessionId);
        }
      }
      
      this.connections.delete(socketId);
    }

    // Clean up rate limiters
    this.rateLimiters.delete(socketId);
  }

  /**
   * Get all peers in a session
   */
  getSessionPeers(sessionId: string): PeerConnection[] {
    const peerSocketIds = this.sessionPeers.get(sessionId);
    if (!peerSocketIds) return [];

    const peers: PeerConnection[] = [];
    peerSocketIds.forEach(socketId => {
      const peer = this.connections.get(socketId);
      if (peer) peers.push(peer);
    });

    return peers;
  }

  /**
   * Handle WebRTC offer
   */
  async handleOffer(
    socket: AuthenticatedSocket, 
    targetUserId: string, 
    offer: RTCSessionDescriptionInit,
    sessionId: string
  ): Promise<boolean> {
    // Check rate limit
    if (!this.checkRateLimit(socket.id, 'offer', signalingRateLimits.offer)) {
      throw new Error('Rate limit exceeded for offers');
    }

    // Validate target is in the same session
    const targetPeer = this.findPeerByUserId(sessionId, targetUserId);
    if (!targetPeer) {
      throw new Error('Target peer not found in session');
    }

    // Update connection state
    const connection = this.connections.get(socket.id);
    if (connection) {
      connection.state = 'connecting';
      connection.peerId = targetPeer.socketId;
      connection.lastActivity = new Date();
    }

    // Store signaling event in database for debugging
    await this.logSignalingEvent(sessionId, socket.user!.id, 'OFFER_SENT', {
      targetUserId,
      timestamp: new Date().toISOString()
    });

    return true;
  }

  /**
   * Handle WebRTC answer
   */
  async handleAnswer(
    socket: AuthenticatedSocket,
    targetUserId: string,
    answer: RTCSessionDescriptionInit,
    sessionId: string
  ): Promise<boolean> {
    // Check rate limit
    if (!this.checkRateLimit(socket.id, 'answer', signalingRateLimits.answer)) {
      throw new Error('Rate limit exceeded for answers');
    }

    // Validate target
    const targetPeer = this.findPeerByUserId(sessionId, targetUserId);
    if (!targetPeer) {
      throw new Error('Target peer not found in session');
    }

    // Update connection state
    const connection = this.connections.get(socket.id);
    if (connection) {
      connection.state = 'connected';
      connection.peerId = targetPeer.socketId;
      connection.lastActivity = new Date();
    }

    // Log event
    await this.logSignalingEvent(sessionId, socket.user!.id, 'ANSWER_SENT', {
      targetUserId,
      timestamp: new Date().toISOString()
    });

    return true;
  }

  /**
   * Handle ICE candidate
   */
  async handleIceCandidate(
    socket: AuthenticatedSocket,
    targetUserId: string,
    candidate: RTCIceCandidateInit,
    sessionId: string
  ): Promise<boolean> {
    // Check rate limit
    if (!this.checkRateLimit(socket.id, 'iceCandidate', signalingRateLimits.iceCandidate)) {
      throw new Error('Rate limit exceeded for ICE candidates');
    }

    // Validate target
    const targetPeer = this.findPeerByUserId(sessionId, targetUserId);
    if (!targetPeer) {
      throw new Error('Target peer not found in session');
    }

    // Update last activity
    const connection = this.connections.get(socket.id);
    if (connection) {
      connection.lastActivity = new Date();
    }

    return true;
  }

  /**
   * Handle media state toggle
   */
  async handleMediaToggle(
    socket: AuthenticatedSocket,
    sessionId: string,
    mediaState: { audio?: boolean; video?: boolean }
  ): Promise<MediaState> {
    // Check rate limit
    if (!this.checkRateLimit(socket.id, 'toggleMedia', signalingRateLimits.toggleMedia)) {
      throw new Error('Rate limit exceeded for media toggles');
    }

    // Update participant media state in database
    const participant = await prisma.sessionParticipant.findFirst({
      where: {
        sessionId,
        userId: socket.user!.id
      }
    });

    if (!participant) {
      throw new Error('Participant not found');
    }

    const updatedParticipant = await prisma.sessionParticipant.update({
      where: { id: participant.id },
      data: {
        isAudioEnabled: mediaState.audio !== undefined ? mediaState.audio : participant.isAudioEnabled,
        isVideoEnabled: mediaState.video !== undefined ? mediaState.video : participant.isVideoEnabled
      }
    });

    return {
      userId: socket.user!.id,
      sessionId,
      isAudioEnabled: updatedParticipant.isAudioEnabled,
      isVideoEnabled: updatedParticipant.isVideoEnabled
    };
  }

  /**
   * Handle connection quality report
   */
  async handleConnectionQuality(
    socket: AuthenticatedSocket,
    quality: ConnectionQuality
  ): Promise<void> {
    // Check rate limit
    if (!this.checkRateLimit(socket.id, 'connectionQuality', signalingRateLimits.connectionQuality)) {
      return; // Silently ignore if rate limited
    }

    const connection = this.connections.get(socket.id);
    if (!connection) return;

    connection.connectionQuality = quality;
    connection.lastActivity = new Date();

    // Check if quality is below thresholds
    const thresholds = webrtcConfig.qualityThresholds;
    const isQualityPoor = 
      quality.packetLossRate > thresholds.minPacketLossRate ||
      quality.jitter > thresholds.minJitter ||
      quality.roundTripTime > thresholds.minRoundTripTime;

    if (isQualityPoor) {
      // Log poor quality event
      await this.logSignalingEvent(connection.sessionId, socket.user!.id, 'POOR_QUALITY', {
        quality,
        timestamp: new Date().toISOString()
      });
    }

    // Update participant connection quality in database
    await prisma.sessionParticipant.updateMany({
      where: {
        sessionId: connection.sessionId,
        userId: socket.user!.id
      },
      data: {
        connectionQuality: quality as any
      }
    });
  }

  /**
   * Handle reconnection attempt
   */
  async handleReconnection(
    socket: AuthenticatedSocket,
    sessionId: string,
    previousSocketId?: string
  ): Promise<boolean> {
    // Check if previous connection exists
    if (previousSocketId) {
      const oldConnection = this.connections.get(previousSocketId);
      if (oldConnection && oldConnection.userId === socket.user!.id) {
        // Transfer connection info to new socket
        const newConnection: PeerConnection = {
          ...oldConnection,
          socketId: socket.id,
          reconnectAttempts: oldConnection.reconnectAttempts + 1,
          lastActivity: new Date()
        };

        // Clean up old connection
        this.unregisterPeer(previousSocketId);
        
        // Register new connection
        this.connections.set(socket.id, newConnection);
        
        // Update session peers
        if (!this.sessionPeers.has(sessionId)) {
          this.sessionPeers.set(sessionId, new Set());
        }
        this.sessionPeers.get(sessionId)!.add(socket.id);

        // Check reconnect attempts limit
        if (newConnection.reconnectAttempts > webrtcConfig.reconnectAttempts) {
          await this.logSignalingEvent(sessionId, socket.user!.id, 'MAX_RECONNECT_EXCEEDED', {
            attempts: newConnection.reconnectAttempts,
            timestamp: new Date().toISOString()
          });
          return false;
        }

        await this.logSignalingEvent(sessionId, socket.user!.id, 'RECONNECTED', {
          attempts: newConnection.reconnectAttempts,
          timestamp: new Date().toISOString()
        });

        return true;
      }
    }

    // New connection
    this.registerPeer(socket, sessionId);
    return true;
  }

  /**
   * Update peer connection state
   */
  updatePeerState(socketId: string, state: PeerConnection['state']): void {
    const connection = this.connections.get(socketId);
    if (connection) {
      connection.state = state;
      connection.lastActivity = new Date();
    }
  }

  /**
   * Find peer by user ID in a session
   */
  private findPeerByUserId(sessionId: string, userId: string): PeerConnection | undefined {
    const peers = this.getSessionPeers(sessionId);
    return peers.find(p => p.userId === userId);
  }

  /**
   * Check rate limit for signaling events
   */
  private checkRateLimit(
    socketId: string,
    eventType: string,
    limit: { points: number; duration: number }
  ): boolean {
    const now = Date.now();
    const windowStart = now - (limit.duration * 1000);

    if (!this.rateLimiters.has(socketId)) {
      this.rateLimiters.set(socketId, new Map());
    }

    const socketLimiter = this.rateLimiters.get(socketId)!;
    const eventKey = `${eventType}:${Math.floor(now / (limit.duration * 1000))}`;
    
    // Clean old entries
    socketLimiter.forEach((timestamp, key) => {
      if (timestamp < windowStart) {
        socketLimiter.delete(key);
      }
    });

    // Count events in current window
    let count = 0;
    socketLimiter.forEach((timestamp, key) => {
      if (key.startsWith(eventType)) {
        count++;
      }
    });

    if (count >= limit.points) {
      return false; // Rate limit exceeded
    }

    // Add current event
    socketLimiter.set(`${eventType}:${now}`, now);
    return true;
  }

  /**
   * Log signaling event for debugging and analytics
   */
  private async logSignalingEvent(
    sessionId: string,
    userId: string,
    eventType: string,
    details: any
  ): Promise<void> {
    try {
      await prisma.signalingLog.create({
        data: {
          sessionId,
          userId,
          eventType,
          details,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to log signaling event:', error);
    }
  }

  /**
   * Clean up stale connections
   */
  async cleanupStaleConnections(): Promise<void> {
    const now = Date.now();
    const staleThreshold = now - (webrtcConfig.connectionTimeout);

    this.connections.forEach((connection, socketId) => {
      if (connection.lastActivity.getTime() < staleThreshold) {
        console.log(`Cleaning up stale connection: ${socketId}`);
        this.unregisterPeer(socketId);
      }
    });
  }

  /**
   * Get connection statistics for monitoring
   */
  getConnectionStats(): {
    totalConnections: number;
    activeSessions: number;
    connectionsByState: Record<string, number>;
  } {
    const stats = {
      totalConnections: this.connections.size,
      activeSessions: this.sessionPeers.size,
      connectionsByState: {} as Record<string, number>
    };

    this.connections.forEach(connection => {
      stats.connectionsByState[connection.state] = 
        (stats.connectionsByState[connection.state] || 0) + 1;
    });

    return stats;
  }
}

export const signalingService = new SignalingService();