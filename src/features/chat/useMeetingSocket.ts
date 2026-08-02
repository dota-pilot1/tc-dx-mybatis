import { useEffect, useRef } from "react";
import { getToken } from "../../shared/api/client";
import { meetingSocketUrl, type MeetingMember, type MeetingMessage } from "./api";

/**
 * meeting WebSocket 연결을 관리한다.
 * - 세션 동안 소켓 1개 유지
 * - activeRoomId가 바뀌면 해당 토픽 구독/해제
 * - activeRoom으로 들어온 MEETING_MESSAGE를 onMessage로 전달
 */
export function useMeetingSocket(
  activeRoomId: string | null,
  onMessage: (message: MeetingMessage) => void,
  onCleared?: () => void,
  onPinned?: (message: MeetingMessage) => void,
  onReaction?: (message: MeetingMessage) => void,
  onPresence?: (members: MeetingMember[]) => void,
) {
  const socketRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  const onClearedRef = useRef(onCleared);
  const onPinnedRef = useRef(onPinned);
  const onReactionRef = useRef(onReaction);
  const onPresenceRef = useRef(onPresence);
  const activeRoomRef = useRef<string | null>(activeRoomId);
  onMessageRef.current = onMessage;
  onClearedRef.current = onCleared;
  onPinnedRef.current = onPinned;
  onReactionRef.current = onReaction;
  onPresenceRef.current = onPresence;

  // 연결 (1회)
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let disposed = false;
    let retryTimer: number | undefined;

    const connect = () => {
      if (disposed) return;
      const ws = new WebSocket(meetingSocketUrl(token));
      socketRef.current = ws;

      ws.onopen = () => {
        const roomId = activeRoomRef.current;
        if (roomId) {
          ws.send(JSON.stringify({ type: "SUBSCRIBE", topic: `meeting/${roomId}` }));
        }
      };

      ws.onmessage = (ev) => {
        let msg: { type: string; data?: unknown };
        try {
          msg = JSON.parse(ev.data as string);
        } catch {
          return;
        }
        if (msg.type === "MEETING_MESSAGE") {
          const data = msg.data as MeetingMessage;
          if (data.roomId === activeRoomRef.current) onMessageRef.current(data);
        } else if (msg.type === "MEETING_MESSAGES_CLEARED") {
          const data = msg.data as { roomId: string } | undefined;
          if (data?.roomId === activeRoomRef.current) onClearedRef.current?.();
        } else if (msg.type === "MEETING_MESSAGE_PINNED") {
          const data = msg.data as MeetingMessage;
          if (data.roomId === activeRoomRef.current) onPinnedRef.current?.(data);
        } else if (msg.type === "MEETING_MESSAGE_REACTION") {
          const data = msg.data as MeetingMessage;
          if (data.roomId === activeRoomRef.current) onReactionRef.current?.(data);
        } else if (msg.type === "MEETING_PRESENCE") {
          const data = msg.data as { members?: MeetingMember[] } | undefined;
          if (data?.members) onPresenceRef.current?.(data.members);
        }
      };

      ws.onclose = () => {
        if (!disposed) retryTimer = window.setTimeout(connect, 3000);
      };

      ws.onerror = () => ws.close();
    };

    connect();

    return () => {
      disposed = true;
      if (retryTimer) window.clearTimeout(retryTimer);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);

  // 방 구독 전환
  useEffect(() => {
    activeRoomRef.current = activeRoomId;
    const ws = socketRef.current;
    if (!activeRoomId || !ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify({ type: "SUBSCRIBE", topic: `meeting/${activeRoomId}` }));
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "UNSUBSCRIBE", topic: `meeting/${activeRoomId}` }));
      }
    };
  }, [activeRoomId]);
}
