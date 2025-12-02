export type TrackingPayload = Record<string, unknown>

export type TrackingClient = {
  track(eventId: string, payload?: TrackingPayload): void
}

const noopTrackingClient: TrackingClient = {
  track: () => {},
}

export const createTrackingClient = (): TrackingClient => noopTrackingClient


