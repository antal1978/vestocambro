export type ConversationState =
  | "idle"
  | "asking_occasion"
  | "asking_weather"
  | "asking_base_item"
  | "generating_suggestions"
  | "showing_suggestions"
  | "completed"
