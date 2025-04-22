import { SlideModal } from './SlideModal';
import { simulateNotification } from '@/lib/notificationService';
import { Notification, NotificationType } from '@/lib/notifications';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type TestNotificationModalProps = {
  visible: boolean;
  onClose: () => void;
};

type NotificationTypeOption = {
  type: NotificationType;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
};

export function TestNotificationModal({ visible, onClose }: TestNotificationModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Notification | null>(null);

  // Notification type options with appropriate icons and descriptions
  const notificationTypes: NotificationTypeOption[] = [
    {
      type: 'crying',
      label: 'Crying Alert',
      icon: <Ionicons name="water" size={24} color="#5d97d3" />,
      description: 'Simulate a crying baby notification',
      color: 'bg-blue-100',
    },
    {
      type: 'prone',
      label: 'Prone Position',
      icon: <FontAwesome6 name="baby" size={24} color="#d26165" />,
      description: 'Simulate baby sleeping in prone position',
      color: 'bg-red-100',
    },
    {
      type: 'side',
      label: 'Side Position',
      icon: <FontAwesome6 name="baby" size={24} color="#d97706" />,
      description: 'Simulate baby sleeping on their side',
      color: 'bg-amber-100',
    },
    {
      type: 'noBlanket',
      label: 'No Blanket',
      icon: <FontAwesome6 name="bed" size={24} color="#a855f7" />,
      description: 'Simulate no blanket coverage notification',
      color: 'bg-purple-100',
    },
    {
      type: 'system',
      label: 'System',
      icon: <MaterialIcons name="notifications" size={24} color="#3d8d7a" />,
      description: 'Simulate a system notification',
      color: 'bg-green-100',
    },
  ];

  // Generate test notification for the selected type
  const handleGenerateNotification = async (type: NotificationType) => {
    setIsGenerating(true);
    try {
      const notification = await simulateNotification(type);
      setLastGenerated(notification);
    } catch (error) {
      console.error('Error generating notification:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SlideModal visible={visible} onClose={onClose} title="Test Notifications">
      <View>
        <Text className="text-base text-gray-600 mb-4">
          Generate test notifications to see how they appear in the app. This is a debugging tool
          for development purposes.
        </Text>

        {/* Last Generated Notification Preview */}
        {lastGenerated && (
          <View className="mb-6 p-4 rounded-lg border border-gray-200">
            <Text className="text-sm font-medium text-gray-500 mb-1">Last Generated:</Text>
            <Text className="font-semibold text-gray-800">{lastGenerated.title}</Text>
            <Text className="text-gray-600 mb-2">{lastGenerated.message}</Text>
            <View className="flex-row">
              <Text className="text-xs text-gray-500">ID: </Text>
              <Text className="text-xs text-gray-400 flex-1">{lastGenerated.id}</Text>
            </View>
          </View>
        )}

        {/* Notification Type Options */}
        <View className="flex-col gap-3">
          {notificationTypes.map((option) => (
            <TouchableOpacity
              key={option.type}
              onPress={() => handleGenerateNotification(option.type)}
              disabled={isGenerating}
              className={`p-4 rounded-lg flex-row items-center ${option.color} ${isGenerating ? 'opacity-50' : ''}`}>
              <View className="h-10 w-10 items-center justify-center rounded-full bg-white mr-3">
                {option.icon}
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-800">{option.label}</Text>
                <Text className="text-sm text-gray-600">{option.description}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Developer Note */}
        <View className="mt-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
          <Text className="text-sm text-yellow-800">
            <Text className="font-semibold">Note: </Text>
            These notifications will appear in the notification center and history screen. They
            simulate real events that would be detected by the monitoring system.
          </Text>
        </View>
      </View>
    </SlideModal>
  );
}
