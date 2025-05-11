import { BaseToast, BaseToastProps, ErrorToast } from 'react-native-toast-message';

// Các loại toast tương ứng với từng loại cảnh báo: side, prone, cry, noblanket

// Sidelay alert toast - màu cam
const SideToast = (props: BaseToastProps) => {
  return (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#d97706',
        backgroundColor: '#fff',
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#78350f',
      }}
      text2Style={{
        fontSize: 14,
        color: '#525252',
      }}
    />
  );
};

// Prone alert toast - màu đỏ
const ProneToast = (props: BaseToastProps) => {
  return (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#d26165',
        backgroundColor: '#fff',
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: '700',
        color: '#881337',
      }}
      text2Style={{
        fontSize: 14,
        color: '#525252',
      }}
    />
  );
};

// Cry alert toast - màu tím
const CryToast = (props: BaseToastProps) => {
  return (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#5d97d3',
        backgroundColor: '#fff',
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#395894',
      }}
      text2Style={{
        fontSize: 14,
        color: '#525252',
      }}
    />
  );
};

// NoBlanket alert toast - màu xanh
const NoBlanketToast = (props: BaseToastProps) => {
  return (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#a855f7',
        backgroundColor: '#fff',
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#581c87',
      }}
      text2Style={{
        fontSize: 14,
        color: '#525252',
      }}
    />
  );
};

// Cấu hình toast để sử dụng trong ứng dụng
export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#10b981', // emerald-500
        backgroundColor: '#fff',
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#10b981', // emerald-500
      }}
      text2Style={{
        fontSize: 14,
        color: '#525252', // neutral-600
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#f43f5e', // rose-500
        backgroundColor: '#fff',
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#f43f5e', // rose-500
      }}
      text2Style={{
        fontSize: 14,
        color: '#525252', // neutral-600
      }}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#0ea5e9', // sky-500
        backgroundColor: '#fff',
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#0ea5e9', // sky-500
      }}
      text2Style={{
        fontSize: 14,
        color: '#525252', // neutral-600
      }}
    />
  ),
  // Thêm các loại toast tùy chỉnh
  side: SideToast,
  prone: ProneToast,
  crying: CryToast,
  noblanket: NoBlanketToast,
};
