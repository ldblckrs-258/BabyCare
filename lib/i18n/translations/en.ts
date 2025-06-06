export const en = {
  common: {
    continue: 'Continue',
    skip: 'Skip',
    signUp: 'Sign up',
    login: 'Login',
    loginNow: 'Login now',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    back: 'Back',
    online: 'Online',
    offline: 'Offline',
    connected: 'Connected',
    connecting: 'Connecting',
    disconnected: 'Disconnected',
    notConnected: 'Not connected',
    noDevices: 'No devices connected',
    connectFirst: 'Go to settings to connect your device first',
    deviceSettings: 'Device Settings',
    loading: 'Loading...',
  },
  home: {
    title: {
      greeting: 'Hello',
      dashboard: 'Your Monitor Dashboard',
    },
    devices: 'Devices',
    noDevices: {
      title: 'No devices connected',
      description: "Connect your BabyCare device to monitor your baby's sleep and crying patterns.",
      button: 'Connect a Device',
    },
    crying: 'Crying',
    notCrying: 'Not crying',
    supine: 'Supine',
    prone: 'Prone',
    side: 'Side',
    blanket: 'Blanket',
    noBlanket: 'No blanket',
    continuouslyFor: 'Continuously for',
    seconds: 'seconds',
  },
  welcome: {
    slides: {
      first: {
        title: ['Welcome to', 'BabyCare'],
        subtitle:
          "Caring for your little one has never been easier or more reassuring. BabyCare is your ultimate companion in monitoring and protecting your child comprehensively, even when you're not right beside them.",
      },
      second: {
        title: ['Safe Sleep Position', 'Monitoring'],
        subtitle:
          "Worry no more about your baby's sleeping position. Our AI system continuously monitors and immediately alerts you to potentially dangerous sleeping postures and keep your child safe.",
      },
      third: {
        title: ['Intelligent', 'Cry Detection'],
        subtitle:
          "Our advanced AI technology analyzes your baby's cries, helping you quickly understand their needs and condition. Receive instant notifications whenever your child requires attention, no matter where you are.",
      },
    },
  },
  auth: {
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    forgotPassword: 'Forgot password?',
    keepLoggedIn: 'Keep logged in',
    loginWithGoogle: 'Login with Google',
    signUpWithGoogle: 'Sign up with Google',
    orLoginWith: 'or login with',
    orSignUpWith: 'or sign up with',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    signUpNow: 'Sign up now',
    loginHere: 'Login here',
    createAccount: 'Create Account',
    agreeToTerms: 'I agree to the',
    termsAndConditions: 'Terms & Conditions',
    and: 'and',
    privacyPolicy: 'Privacy Policy',
    login: 'Login',
    register: 'Register',
    errors: {
      signInFailed: 'Sign in failed',
      signInCancelled: 'Sign in cancelled',
      invalidEmailOrPassword: 'Invalid email or password',
    },
  },
  settings: {
    title: 'Settings',
    profile: {
      title: 'Profile',
      email: 'Email',
      displayName: 'Display Name',
      displayNamePlaceholder: 'Enter your display name',
      displayNameMessage: 'Change your display name',
      changePassword: 'Change Password',
      currentPassword: 'Current password',
      newPassword: 'New password',
      confirmPassword: 'Confirm new password',
      saveButton: 'Save Changes',
      signOut: 'Sign Out',
      errors: {
        displayNameLength: 'Display name must be at least 3 characters',
        passwordIncorrect: 'Password is incorrect',
        passwordChangeFailed: 'Password change failed',
        passwordTooShort: 'Password must be at least 6 characters',
        passwordMismatch: 'Passwords do not match',
      },
    },
    devices: {
      title: 'Devices',
      status: 'Status',
      notConnected: 'Not Connected',
      connected: 'Connected',
      helpText: 'Make sure your BabyCare device is turned on and connected to the internet.',
      errors: {
        noDeviceMatch: 'No device found with this QR code or device connected',
      },
    },
    notifications: {
      title: 'Notifications',
      enable: 'Enable Notifications',
      enableDescription: "Enable notifications to receive alerts about your baby's status",
      batteryOptimizationTitle: 'Turn off Battery Optimization',
      batteryOptimizationDescription:
        'To receive notifications reliably, please turn off battery optimization for the application.',
    },
    language: {
      title: 'Language',
      save: 'Save Language',
    },
    privacyAndTerms: {
      title: 'Privacy & Terms',
      privacyTitle: 'Privacy Policy',
      termsTitle: 'Terms of Service',
      dataCollection: {
        title: 'Data Collection',
        content:
          "BabyCare collects data related to your baby's sleep patterns, crying episodes, and device usage. This data is used to provide you with insights and alerts about your baby's well-being.",
      },
      dataStorage: {
        title: 'Data Storage',
        content:
          'All data is securely stored and encrypted. We use industry-standard security measures to protect your information. Your data is stored on secure servers and is only accessible to you through your authenticated account.',
      },
      dataSharing: {
        title: 'Data Sharing',
        content:
          "We do not sell or share your personal data with third parties. Your baby's information remains private and is only used to provide the services you've requested.",
      },
      license: {
        title: 'License',
        content:
          'BabyCare grants you a limited, non-exclusive, non-transferable license to use the application for personal, non-commercial purposes.',
      },
      restrictions: {
        title: 'Restrictions',
        content:
          'You may not modify, distribute, or create derivative works based on our application. The app and its content remain the property of BabyCare.',
      },
      disclaimer: {
        title: 'Disclaimer',
        content:
          'BabyCare is designed as a supplementary tool for baby monitoring and should not replace proper adult supervision. We are not responsible for any incidents that may occur while using our application.',
      },
      contact: {
        title: 'Contact Us',
        content:
          'If you have any questions about our Privacy Policy or Terms of Service, please contact us at:',
      },
    },
    version: 'Version',
  },
  devices: {
    title: 'Devices',
    addNewDevice: 'Add a New Device',
    scanQR: 'Scan QR Code',
    scanDescription: 'Scan the QR code on your device to connect',
    helpText:
      "Make sure your BabyCare device is turned on and within range. If you're having trouble connecting, try restarting the device.",
    connectedDevices: 'Connected Devices',
    noDevicesConnected: 'No devices connected',
    rename: {
      title: 'Rename Device',
      message: 'Enter a new name for this device:',
      placeholder: 'Enter device name',
    },
    threshold: {
      title: 'Alert Threshold',
      message: 'Set alert threshold in minutes:',
    },
    thresholds: {
      title: 'Alert Thresholds',
      crying: 'Crying Threshold',
      cryingDescription: 'Threshold for crying detection in seconds',
      side: 'Side Threshold',
      sideDescription: 'Threshold for side detection in seconds',
      prone: 'Prone Threshold',
      proneDescription: 'Threshold for prone detection in seconds',
      noBlanket: 'No Blanket Threshold',
      noBlanketDescription: 'Threshold for blanket detection in seconds',
      seconds: 'seconds',
      off: 'Off',
    },
    shortThreshold: {
      cry: 'Cry',
      side: 'side',
      prone: 'prone',
      noBlanket: 'No Blanket',
    },
    disconnect: {
      title: 'Disconnect Device',
      message: 'Are you sure you want to disconnect this device?',
      confirm: 'Disconnect',
    },
    options: {
      rename: 'Rename Device',
      threshold: 'Change Alert Threshold',
      disconnect: 'Disconnect Device',
    },
    notifications: {
      title: 'Notification Settings',
      cryDetection: {
        title: 'Cry Detection Threshold',
        description: 'Alert when baby is crying continuously',
      },
      sleepPosition: {
        title: 'Sleep Position',
        description: 'Alert for unsafe sleeping positions',
      },
      deviceDisconnected: {
        title: 'Device Disconnected',
        description: 'Alert when device disconnects',
      },
      dailyReport: {
        title: 'Daily Report',
        description: 'Receive daily summary reports',
      },
    },
    language: {
      title: 'Language',
      save: 'Save Language',
    },
    privacyAndTerms: {
      title: 'Privacy & Terms',
      dataCollection: {
        title: 'Data Collection',
        content:
          "BabyCare collects data related to your baby's sleep patterns, crying episodes, and device usage. This data is used to provide you with insights and alerts about your baby's well-being.",
      },
      dataStorage: {
        title: 'Data Storage',
        content:
          'All data is securely stored and encrypted. We use industry-standard security measures to protect your information. Your data is stored on secure servers and is only accessible to you through your authenticated account.',
      },
      dataSharing: {
        title: 'Data Sharing',
        content:
          "We do not sell or share your personal data with third parties. Your baby's information remains private and is only used to provide the services you've requested.",
      },
      license: {
        title: 'License',
        content:
          'BabyCare grants you a limited, non-exclusive, non-transferable license to use the application for personal, non-commercial purposes.',
      },
      restrictions: {
        title: 'Restrictions',
        content:
          'You may not modify, distribute, or create derivative works based on our application. The app and its content remain the property of BabyCare.',
      },
      disclaimer: {
        title: 'Disclaimer',
        content:
          'BabyCare is designed as a supplementary tool for baby monitoring and should not replace proper adult supervision. We are not responsible for any incidents that may occur while using our application.',
      },
      contactUs: {
        title: 'Contact Us',
        content:
          'If you have any questions about our Privacy Policy or Terms of Service, please contact us at:',
      },
    },
    version: 'Version',
  },
  tabs: {
    streaming: 'Streaming',
    history: 'History',
    home: 'Home',
    statistics: 'Statistics',
    settings: 'Settings',
  },
  history: {
    allEvents: 'All Events',
    today: 'Today',
    yesterday: 'Yesterday',
    loading: 'Loading notifications...',
    loadingMore: 'Loading more...',
    noNotifications: 'No notifications yet',
    notificationsWillAppearHere: 'When you receive notifications, they will appear here',
    markAllAsRead: 'Mark all as read',
    deleteAll: 'Delete all',
    notificationTypes: {
      cryAlert: 'Cry Alert',
      positionAlert: 'Sleep Position Alert',
      dailyReport: 'Daily Report',
      system: 'System Notification',
    },
    crying: {
      title: 'Crying alert',
      description: 'Your baby is crying continuously for',
    },
    prone: {
      title: 'Prone position alert',
      description: 'Your baby is in a prone position for',
    },
    side: {
      title: 'Side position alert',
      description: 'Your baby is in a side position for',
    },
    noBlanket: {
      title: 'No blanket alert',
      description: 'Your baby is without a blanket for',
    },
    system: {
      title: 'System notification',
      description: 'Your device has been disconnected',
    },
    unknown: {
      title: 'BabyCare notification',
      description: 'Your baby was changed position or started crying',
    },
  },
  streaming: {
    title: 'Streaming Camera',
    live: 'Live',
    tapToView: 'Tap to view',
    streamInfo: 'Stream Information',
    connectingToStream: 'Connecting to stream...',
    retry: 'Retry',
    invalidUri: 'Stream is not available now, please restart the device',
    status: {
      title: 'Status',
      connecting: 'Connecting...',
      error: 'Error',
      active: 'Active',
      disconnected: 'Disconnected',
    },
    quality: {
      title: 'Quality',
      hd: 'HD (720p)',
    },
    connection: {
      title: 'Connection',
      wifi: 'WiFi',
      mobileData: 'Mobile Data',
    },
    errorMessage: {
      connectionFailed: 'Could not connect to the stream',
      streamNotFound: 'Device streaming is not available now, please restart the device',
    },
  },
  statistics: {
    title: 'Statistics',
    selectDevice: 'Select Device',
    noDevices: 'No devices connected',
    todayOverview: 'Today Overview',
    badPosition: 'Bad Position',
    crying: 'Crying',
    totalTime: 'Total time',
    totalTimes: 'Total times',
    totalMinutes: 'Total minutes',
    longestPeriod: 'Longest period',
    longestDuration: 'Longest duration',
    correlate: 'Correlate',
    min: 'min',
  },
  register: {
    title: 'Register',
    signUpWithGoogle: 'Sign up with Google',
    orSignUpWith: 'or sign up with',
    fullName: 'Full Name',
    fullNamePlaceholder: 'John Doe',
    email: 'Email Address',
    emailPlaceholder: 'johndoe@gmail.com',
    password: 'Password',
    passwordPlaceholder: '••••••••',
    confirmPassword: 'Confirm Password',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    loginHere: 'Login here',
    fillAllFields: 'Please fill in all fields',
    passwordsMismatch: 'Passwords do not match',
    agreeToTerms: 'Please agree to Terms & Conditions',
    error: 'An error occurred during registration',
  },
};
