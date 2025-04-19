import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, ScrollView } from 'react-native';
import { Appbar, Provider } from 'react-native-paper';

type SlideModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export function SlideModal({ visible, onClose, title, children }: SlideModalProps) {
  // Animation for right slide
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;

  useEffect(() => {
    if (visible) {
      // Slide in from right
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide out to right
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').width,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleModalClose = () => {
    // First animate the modal out
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').width,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Then call the original onClose after animation completes
      onClose();
    });
  };

  return (
    <Modal animationType="none" transparent visible={visible} onRequestClose={handleModalClose}>
      <Provider>
        <Animated.View
          className="flex-1 bg-white absolute right-0 top-0 bottom-0"
          style={{
            transform: [{ translateX: slideAnim }],
            width: '100%',
            shadowColor: '#000',
            shadowOffset: { width: -2, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 5,
            elevation: 5,
          }}>
          <Appbar.Header
            statusBarHeight={0}
            mode="small"
            style={
              {
                backgroundColor: 'white',
                borderBottomWidth: 1,
                borderColor: '#eee',
              } as any
            }>
            <Appbar.BackAction onPress={handleModalClose} />
            <Appbar.Content title={title} />
          </Appbar.Header>
          <ScrollView className="flex-1 p-6">
            {/* Content */}
            {children}
          </ScrollView>
        </Animated.View>
      </Provider>
    </Modal>
  );
}
