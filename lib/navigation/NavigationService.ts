import { RootStackParamList } from '@/types/navigation';
import { createNavigationContainerRef } from '@react-navigation/native';

// Tạo navigation ref để có thể điều hướng từ bất kỳ đâu
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Hàm navigate có thể gọi từ bất kỳ đâu trong ứng dụng
export function navigate(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
