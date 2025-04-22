export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Auth: undefined;
  Streaming:
    | {
        deviceId?: string;
        connectionId?: string;
        openModal?: boolean;
      }
    | undefined;
  Settings:
    | {
        modal?: 'profile' | 'devices' | 'notifications' | 'privacy';
      }
    | undefined;
};
