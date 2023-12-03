export type ChatSettings = {
  active: boolean,
  allowMessageDelete: boolean,
  allowMessageEdit: boolean,
  deleteEmptyRooms: boolean,
  auditMode: boolean,
  explicit_room_joins: {
    enabled: boolean,
    send_email: boolean,
    send_notification: boolean,
  },
}
