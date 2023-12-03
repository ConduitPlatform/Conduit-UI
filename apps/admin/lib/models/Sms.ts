export type SmsSettings = {
  active: boolean,
  providerName: string,
  twilio: TwilioSettings,
  awsSns: SnsSettings
  messageBird: MessageBirdSettings,
  clickSend: ClickSendSettings,
}

type TwilioSettings = {
  phoneNumber: string,
  accountSID: string,
  authToken: string,
  verify: {
    active: boolean,
    serviceSid: string
  },
}
type SnsSettings = {
  region: string,
  accessKeyId: string,
  secretAccessKey: string,
}
type MessageBirdSettings = {
  accessKeyId: string,
  originatorName: string,
}
type ClickSendSettings = {
  username: string,
  clicksendApiKey: string,
}
