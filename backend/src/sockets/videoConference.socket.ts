import { Server, Namespace, Socket } from 'socket.io';
import { AuthenticatedSocket } from '../middleware/socketAuth';
import { videoSessionService } from '../services/videoSession.service';
import { signalingService } from '../services/signaling.service';
import {
  authenticateSocket,
  validateSessionParticipant,
  canModerateSession,
  logSocketConnection
} from '../middleware/socketAuth';

interface JoinRoomData {
  sessionId: string;
  previousSocketId?: string;
}

interface SignalingData {
  to: string;
  sessionId: string;
}

interface OfferData extends SignalingData {
  offer: any; // RTCSessionDescriptionInit
}

interface AnswerData extends SignalingData {
  answer: any; // RTCSessionDescriptionInit
}

interface IceCandidateData extends SignalingData {
  candidate: any; // RTCIceCandidateInit
}

interface MediaToggleData {
  sessionId: string;
  audio?: boolean;
  video?: boolean;
}

interface ConnectionQualityData {
  packetLossRate: number;
  jitter: number;
  roundTripTime: number;
  bandwidth: {
    upload: number;
    download: number;
  };
}

export class VideoConferenceNamespace {
  private namespace: Namespace;
  private activeRooms: Map<string, Set<string>> = new Map();

  constructor(io: Server) {
    this.namespace = io.of('/video-conference');
    this.setupNamespace();
  }

  private setupNamespace() {
    // Apply authentication middleware
    this.namespace.use(authenticateSocket);

    this.namespace.on('connection', (socket: Socket) => {
      const authSocket = socket as AuthenticatedSocket;
      console.log(`User ${authSocket.user?.id} connected to video conference namespace`);
      
      // Log connection
      logSocketConnection(authSocket, 'connect');

      // Set up event handlers
      this.setupSocketHandlers(authSocket);

      // Handle disconnect
      authSocket.on('disconnect', () => {
        this.handleDisconnect(authSocket);
      });
    });

    // Periodic cleanup of stale connections
    setInterval(() => {
      signalingService.cleanupStaleConnections();
    }, 30000); // Every 30 seconds
  }

  private setupSocketHandlers(socket: AuthenticatedSocket) {
    // Join room event
    socket.on('join-room', async (data: JoinRoomData, callback) => {
      try {
        await this.handleJoinRoom(socket, data);
        callback({ success: true });
      } catch (error: any) {
        console.error('Error joining room:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Leave room event
    socket.on('leave-room', async (data: { sessionId: string }, callback) => {
      try {
        await this.handleLeaveRoom(socket, data.sessionId);
        callback({ success: true });
      } catch (error: any) {
        console.error('Error leaving room:', error);
        callback({ success: false, error: error.message });
      }
    });

    // WebRTC signaling events
    socket.on('offer', async (data: OfferData, callback) => {
      try {
        await this.handleOffer(socket, data);
        callback({ success: true });
      } catch (error: any) {
        console.error('Error handling offer:', error);
        callback({ success: false, error: error.message });
      }
    });

    socket.on('answer', async (data: AnswerData, callback) => {
      try {
        await this.handleAnswer(socket, data);
        callback({ success: true });
      } catch (error: any) {
        console.error('Error handling answer:', error);
        callback({ success: false, error: error.message });
      }
    });

    socket.on('ice-candidate', async (data: IceCandidateData, callback) => {
      try {
        await this.handleIceCandidate(socket, data);
        callback({ success: true });
      } catch (error: any) {
        console.error('Error handling ICE candidate:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Media control events
    socket.on('toggle-media', async (data: MediaToggleData, callback) => {
      try {
        await this.handleMediaToggle(socket, data);
        callback({ success: true });
      } catch (error: any) {
        console.error('Error toggling media:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Connection quality reporting
    socket.on('connection-quality', async (data: ConnectionQualityData) => {
      try {
        await this.handleConnectionQuality(socket, data);
      } catch (error) {
        console.error('Error handling connection quality:', error);
      }
    });

    // Session moderation events (for tutors/admins)
    socket.on('end-session', async (data: { sessionId: string }, callback) => {
      try {
        await this.handleEndSession(socket, data.sessionId);
        callback({ success: true });
      } catch (error: any) {
        console.error('Error ending session:', error);
        callback({ success: false, error: error.message });
      }
    });

    socket.on('kick-participant', async (data: { sessionId: string; userId: string }, callback) => {
      try {
        await this.handleKickParticipant(socket, data.sessionId, data.userId);
        callback({ success: true });
      } catch (error: any) {
        console.error('Error kicking participant:', error);
        callback({ success: false, error: error.message });
      }
    });
  }

  private async handleJoinRoom(socket: AuthenticatedSocket, data: JoinRoomData) {
    const { sessionId, previousSocketId } = data;

    // Validate participant
    const isValid = await validateSessionParticipant(socket, sessionId);
    if (!isValid) {
      throw new Error('Not authorized to join this session');
    }

    // Handle reconnection if previous socket ID provided
    if (previousSocketId) {
      const reconnected = await signalingService.handleReconnection(
        socket,
        sessionId,
        previousSocketId
      );
      if (!reconnected) {
        throw new Error('Failed to reconnect to session');
      }
    } else {
      // Register new peer
      signalingService.registerPeer(socket, sessionId);
    }

    // Join Socket.io room
    await socket.join(sessionId);

    // Add to active rooms tracking
    if (!this.activeRooms.has(sessionId)) {
      this.activeRooms.set(sessionId, new Set());
    }
    this.activeRooms.get(sessionId)!.add(socket.id);

    // Update session participant status
    await videoSessionService.joinSession({
      sessionId,
      userId: socket.user!.id
    });

    // Get current participants
    const peers = signalingService.getSessionPeers(sessionId);
    const otherPeers = peers.filter(p => p.socketId !== socket.id);

    // Notify other participants
    socket.to(sessionId).emit('user-joined', {
      userId: socket.user!.id,
      socketId: socket.id,
      userInfo: {
        id: socket.user!.id,
        email: socket.user!.email,
        role: socket.user!.role
      }
    });

    // Send current participants to the joining user
    socket.emit('current-participants', {
      participants: otherPeers.map(p => ({
        userId: p.userId,
        socketId: p.socketId,
        state: p.state
      }))
    });

    // Check session expiry
    const expiry = await videoSessionService.checkSessionExpiry(sessionId);
    if (expiry.isExpiring) {
      socket.emit('session-expiring', {
        minutesRemaining: expiry.minutesRemaining
      });
    }
  }

  private async handleLeaveRoom(socket: AuthenticatedSocket, sessionId: string) {
    // Leave Socket.io room
    await socket.leave(sessionId);

    // Remove from active rooms
    const roomSockets = this.activeRooms.get(sessionId);
    if (roomSockets) {
      roomSockets.delete(socket.id);
      if (roomSockets.size === 0) {
        this.activeRooms.delete(sessionId);
      }
    }

    // Unregister peer
    signalingService.unregisterPeer(socket.id);

    // Update session participant status
    await videoSessionService.leaveSession(sessionId, socket.user!.id);

    // Notify other participants
    socket.to(sessionId).emit('user-left', {
      userId: socket.user!.id,
      socketId: socket.id
    });
  }

  private async handleOffer(socket: AuthenticatedSocket, data: OfferData) {
    const { to, sessionId, offer } = data;

    // Validate and handle offer
    await signalingService.handleOffer(socket, to, offer, sessionId);

    // Find target socket
    const targetPeer = signalingService.getSessionPeers(sessionId)
      .find(p => p.userId === to);

    if (targetPeer) {
      // Forward offer to target peer
      this.namespace.to(targetPeer.socketId).emit('offer', {
        from: socket.user!.id,
        offer,
        sessionId
      });
    }
  }

  private async handleAnswer(socket: AuthenticatedSocket, data: AnswerData) {
    const { to, sessionId, answer } = data;

    // Validate and handle answer
    await signalingService.handleAnswer(socket, to, answer, sessionId);

    // Find target socket
    const targetPeer = signalingService.getSessionPeers(sessionId)
      .find(p => p.userId === to);

    if (targetPeer) {
      // Forward answer to target peer
      this.namespace.to(targetPeer.socketId).emit('answer', {
        from: socket.user!.id,
        answer,
        sessionId
      });

      // Update connection states
      signalingService.updatePeerState(socket.id, 'connected');
      signalingService.updatePeerState(targetPeer.socketId, 'connected');
    }
  }

  private async handleIceCandidate(socket: AuthenticatedSocket, data: IceCandidateData) {
    const { to, sessionId, candidate } = data;

    // Validate and handle ICE candidate
    await signalingService.handleIceCandidate(socket, to, candidate, sessionId);

    // Find target socket
    const targetPeer = signalingService.getSessionPeers(sessionId)
      .find(p => p.userId === to);

    if (targetPeer) {
      // Forward ICE candidate to target peer
      this.namespace.to(targetPeer.socketId).emit('ice-candidate', {
        from: socket.user!.id,
        candidate,
        sessionId
      });
    }
  }

  private async handleMediaToggle(socket: AuthenticatedSocket, data: MediaToggleData) {
    const { sessionId, audio, video } = data;

    // Update media state
    const mediaState = await signalingService.handleMediaToggle(socket, sessionId, {
      audio,
      video
    });

    // Broadcast media state change to all participants
    socket.to(sessionId).emit('media-state-changed', {
      userId: socket.user!.id,
      isAudioEnabled: mediaState.isAudioEnabled,
      isVideoEnabled: mediaState.isVideoEnabled
    });
  }

  private async handleConnectionQuality(socket: AuthenticatedSocket, data: ConnectionQualityData) {
    await signalingService.handleConnectionQuality(socket, {
      ...data,
      timestamp: new Date()
    });

    // If quality is poor, notify the user
    const thresholds = {
      minPacketLossRate: 0.05,
      minJitter: 30,
      minRoundTripTime: 150
    };

    const isQualityPoor = 
      data.packetLossRate > thresholds.minPacketLossRate ||
      data.jitter > thresholds.minJitter ||
      data.roundTripTime > thresholds.minRoundTripTime;

    if (isQualityPoor) {
      socket.emit('poor-connection-quality', {
        message: 'Your connection quality is poor. Consider turning off video or moving closer to your router.'
      });
    }
  }

  private async handleEndSession(socket: AuthenticatedSocket, sessionId: string) {
    // Check if user can moderate
    const canModerate = await canModerateSession(socket, sessionId);
    if (!canModerate) {
      throw new Error('Not authorized to end this session');
    }

    // End the session
    await videoSessionService.endSession(sessionId);

    // Notify all participants
    this.namespace.to(sessionId).emit('session-ended', {
      endedBy: socket.user!.id,
      reason: 'Session ended by moderator'
    });

    // Disconnect all participants
    const roomSockets = this.activeRooms.get(sessionId);
    if (roomSockets) {
      roomSockets.forEach(socketId => {
        const peerSocket = this.namespace.sockets.get(socketId);
        if (peerSocket) {
          peerSocket.leave(sessionId);
          peerSocket.disconnect();
        }
      });
      this.activeRooms.delete(sessionId);
    }
  }

  private async handleKickParticipant(
    socket: AuthenticatedSocket,
    sessionId: string,
    userId: string
  ) {
    // Check if user can moderate
    const canModerate = await canModerateSession(socket, sessionId);
    if (!canModerate) {
      throw new Error('Not authorized to kick participants');
    }

    // Find the participant's socket
    const targetPeer = signalingService.getSessionPeers(sessionId)
      .find(p => p.userId === userId);

    if (targetPeer) {
      // Notify the kicked participant
      this.namespace.to(targetPeer.socketId).emit('kicked', {
        kickedBy: socket.user!.id,
        reason: 'You have been removed from the session'
      });

      // Disconnect the participant
      const peerSocket = this.namespace.sockets.get(targetPeer.socketId);
      if (peerSocket) {
        peerSocket.leave(sessionId);
        peerSocket.disconnect();
      }

      // Update session participant status
      await videoSessionService.leaveSession(sessionId, userId);

      // Notify other participants
      socket.to(sessionId).emit('participant-kicked', {
        userId,
        kickedBy: socket.user!.id
      });
    }
  }

  private async handleDisconnect(socket: AuthenticatedSocket) {
    console.log(`User ${socket.user?.id} disconnected from video conference`);

    // Find all rooms the socket was in
    const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);

    for (const sessionId of rooms) {
      // Remove from active rooms
      const roomSockets = this.activeRooms.get(sessionId);
      if (roomSockets) {
        roomSockets.delete(socket.id);
        if (roomSockets.size === 0) {
          this.activeRooms.delete(sessionId);
        }
      }

      // Unregister peer
      signalingService.unregisterPeer(socket.id);

      // Update session participant status
      if (socket.user) {
        await videoSessionService.leaveSession(sessionId, socket.user.id);

        // Notify other participants
        socket.to(sessionId).emit('user-disconnected', {
          userId: socket.user.id,
          socketId: socket.id
        });
      }
    }

    // Log disconnection
    logSocketConnection(socket, 'disconnect');
  }

  public getNamespace(): Namespace {
    return this.namespace;
  }

  public getActiveRooms(): Map<string, Set<string>> {
    return this.activeRooms;
  }

  public getConnectionStats() {
    return {
      activeRooms: this.activeRooms.size,
      totalConnections: this.namespace.sockets.size,
      signalingStats: signalingService.getConnectionStats()
    };
  }
}