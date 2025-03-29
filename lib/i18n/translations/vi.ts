export const vi = {
  common: {
    continue: 'Tiếp tục',
    skip: 'Bỏ qua',
    signUp: 'Đăng ký',
    login: 'Đăng nhập',
    loginNow: 'Đăng nhập ngay',
    save: 'Lưu',
    cancel: 'Hủy',
    close: 'Đóng',
    back: 'Quay lại',
  },
  home: {
    title: {
      greeting: 'Xin chào',
      dashboard: 'Bảng điều khiển của bạn',
    },
    device: {
      connected: {
        title: 'Đã kết nối',
        description: 'Đang theo dõi',
      },
      notConnected: {
        title: 'Chưa kết nối',
        description: 'Không có thiết bị nào',
      },
    },
    badPosition: {
      true: {
        title: 'Tư thế không tốt',
        description: 'Liên tục trong',
      },
      false: {
        title: 'Tư thế tốt',
        description: 'Mọi thứ đều ổn',
      },
    },
    cry: {
      true: {
        title: 'Đang khóc',
        description: 'Liên tục trong',
      },
      false: {
        title: 'Không khóc',
        description: 'Mọi thứ đều ổn',
      },
    },
    latestEvents: 'Sự kiện gần đây',
    viewAll: 'Xem tất cả',
    noRecentEvents: 'Không có sự kiện gần đây',
  },
  welcome: {
    slides: {
      first: {
        title: ['Chào mừng đến với', 'BabyCare'],
        subtitle:
          'Chăm sóc con yêu của bạn chưa bao giờ dễ dàng và đảm bảo hơn thế. BabyCare là người bạn đồng hành lý tưởng trong việc theo dõi và bảo vệ con bạn một cách toàn diện, ngay cả khi bạn không ở bên cạnh.',
      },
      second: {
        title: ['Giám sát', 'Tư thế ngủ an toàn'],
        subtitle:
          'Không còn phải lo lắng về tư thế ngủ của bé. Hệ thống AI của chúng tôi liên tục theo dõi và ngay lập tức cảnh báo bạn về các tư thế ngủ có thể gây nguy hiểm và giữ an toàn cho con bạn.',
      },
      third: {
        title: ['Phát hiện', 'Tiếng khóc thông minh'],
        subtitle:
          'Công nghệ AI tiên tiến của chúng tôi phân tích tiếng khóc của bé, giúp bạn nhanh chóng hiểu nhu cầu và tình trạng của bé. Nhận thông báo ngay lập tức bất cứ khi nào con bạn cần sự chú ý, bất kể bạn đang ở đâu.',
      },
    },
  },
  auth: {
    email: 'Email',
    password: 'Mật khẩu',
    confirmPassword: 'Xác nhận mật khẩu',
    fullName: 'Họ và tên',
    forgotPassword: 'Quên mật khẩu?',
    keepLoggedIn: 'Duy trì đăng nhập',
    loginWithGoogle: 'Đăng nhập với Google',
    signUpWithGoogle: 'Đăng ký với Google',
    orLoginWith: 'hoặc đăng nhập với',
    orSignUpWith: 'hoặc đăng ký với',
    dontHaveAccount: 'Chưa có tài khoản?',
    alreadyHaveAccount: 'Đã có tài khoản?',
    signUpNow: 'Đăng ký ngay',
    loginHere: 'Đăng nhập tại đây',
    createAccount: 'Tạo tài khoản',
    agreeToTerms: 'Tôi đồng ý với',
    termsAndConditions: 'Điều khoản & Điều kiện',
    and: 'và',
    privacyPolicy: 'Chính sách bảo mật',
  },
  settings: {
    title: 'Cài đặt',
    profile: {
      title: 'Hồ sơ',
      email: 'Email',
      displayName: 'Tên hiển thị',
      displayNamePlaceholder: 'Nhập tên hiển thị của bạn',
      changePassword: 'Đổi mật khẩu',
      currentPassword: 'Mật khẩu hiện tại',
      newPassword: 'Mật khẩu mới',
      confirmPassword: 'Xác nhận mật khẩu mới',
      changePasswordButton: 'Đổi mật khẩu',
      signOut: 'Đăng xuất',
    },
    deviceConnection: {
      title: 'Kết nối thiết bị',
      status: 'Trạng thái',
      notConnected: 'Chưa kết nối',
      connected: 'Đã kết nối',
      scanQRCode: 'Quét mã QR',
      scanQRCodeDescription: 'Quét mã QR trên thiết bị của bạn để kết nối',
      helpText:
        'Đảm bảo thiết bị BabyCare của bạn đã được bật và trong phạm vi kết nối. Nếu bạn gặp khó khăn trong việc kết nối, hãy thử khởi động lại thiết bị.',
    },
    notifications: {
      title: 'Cài đặt thông báo',
      cryDetection: {
        title: 'Ngưỡng cảnh báo khóc',
        description: 'Thông báo khi bé khóc liên tục',
      },
      sleepPosition: {
        title: 'Ngưỡng cảnh báo tư thế',
        description: 'Thông báo tư thế ngủ không an toàn',
      },
      deviceDisconnected: {
        title: 'Thiết bị ngắt kết nối',
        description: 'Thông báo khi thiết bị mất kết nối',
      },
      dailyReport: {
        title: 'Báo cáo hàng ngày',
        description: 'Nhận báo cáo tổng hợp hàng ngày',
      },
    },
    language: {
      title: 'Ngôn ngữ',
      save: 'Lưu ngôn ngữ',
    },
    privacyAndTerms: {
      title: 'Quyền riêng tư & Điều khoản',
      dataCollection: {
        title: 'Thu thập dữ liệu',
        content:
          'BabyCare thu thập dữ liệu liên quan đến thói quen ngủ, tiếng khóc và việc sử dụng thiết bị của bé. Dữ liệu này được sử dụng để cung cấp cho bạn những thông tin chi tiết và cảnh báo về sức khỏe của bé.',
      },
      dataStorage: {
        title: 'Lưu trữ dữ liệu',
        content:
          'Tất cả dữ liệu được lưu trữ an toàn và mã hóa. Chúng tôi sử dụng các biện pháp bảo mật tiêu chuẩn để bảo vệ thông tin của bạn. Dữ liệu của bạn được lưu trữ trên các máy chủ an toàn và chỉ có thể truy cập thông qua tài khoản đã xác thực của bạn.',
      },
      dataSharing: {
        title: 'Chia sẻ dữ liệu',
        content:
          'Chúng tôi không bán hoặc chia sẻ dữ liệu cá nhân của bạn với bên thứ ba. Thông tin của bé vẫn được giữ riêng tư và chỉ được sử dụng để cung cấp các dịch vụ mà bạn đã yêu cầu.',
      },
      license: {
        title: 'Giấy phép',
        content:
          'BabyCare cấp cho bạn giấy phép có giới hạn, không độc quyền, không thể chuyển nhượng để sử dụng ứng dụng cho mục đích cá nhân, phi thương mại.',
      },
      restrictions: {
        title: 'Hạn chế',
        content:
          'Bạn không được sửa đổi, phân phối hoặc tạo các tác phẩm phái sinh dựa trên ứng dụng của chúng tôi. Ứng dụng và nội dung của nó vẫn là tài sản của BabyCare.',
      },
      disclaimer: {
        title: 'Tuyên bố miễn trừ',
        content:
          'BabyCare được thiết kế như một công cụ hỗ trợ theo dõi em bé và không nên thay thế việc giám sát của người lớn. Chúng tôi không chịu trách nhiệm về bất kỳ sự cố nào có thể xảy ra trong quá trình sử dụng ứng dụng.',
      },
      contactUs: {
        title: 'Liên hệ với chúng tôi',
        content:
          'Nếu bạn có bất kỳ câu hỏi nào về Chính sách Quyền riêng tư hoặc Điều khoản Dịch vụ, vui lòng liên hệ với chúng tôi tại:',
      },
    },
    version: 'Phiên bản',
  },
  tabs: {
    streaming: 'Theo dõi',
    history: 'Lịch sử',
    home: 'Trang chủ',
    statistics: 'Thống kê',
    settings: 'Cài đặt',
  },
  streaming: {
    live: 'Trực tiếp',
    streamInfo: 'Thông tin stream',
    connectingToStream: 'Đang kết nối stream...',
    retry: 'Thử lại',
    status: {
      title: 'Trạng thái',
      connecting: 'Đang kết nối...',
      error: 'Lỗi',
      active: 'Hoạt động',
      disconnected: 'Mất kết nối',
    },
    quality: {
      title: 'Chất lượng',
      hd: 'HD (720p)',
    },
    connection: {
      title: 'Kết nối',
      wifi: 'WiFi',
      mobileData: 'Dữ liệu di động',
    },
    errorMessage: {
      connectionFailed: 'Không thể kết nối đến stream',
    }
  }
};
